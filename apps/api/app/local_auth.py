"""Installation-local accounts for credential-free demos. Production uses Supabase."""

import hashlib
import hmac
import os
import re
import secrets
import time
import uuid
from threading import Lock
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from .db import Session, Account, AccountSession

router = APIRouter(prefix="/auth")
COOKIE = "cineverse_session"
_attempts = {}
_lock = Lock()


def enabled():
    return os.getenv("DEMO_MODE", "true").lower() == "true" and not os.getenv("SUPABASE_URL")


def guard(request):
    if not enabled():
        raise HTTPException(404, "Local accounts are disabled; use Supabase sign-in")
    origin = request.headers.get("origin")
    if origin and origin not in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","):
        raise HTTPException(403, "Untrusted origin")


def account_for(token):
    if not token or not enabled():
        return None
    with Session() as db:
        session = db.get(AccountSession, hashlib.sha256(token.encode()).hexdigest())
        return (
            db.get(Account, session.account_id)
            if session and session.expires > time.time()
            else None
        )


def password_hash(password, salt):
    return hashlib.scrypt(
        password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1, dklen=64
    ).hex()


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    name: str = Field(default="Movie lover", min_length=1, max_length=80)


def authenticate(body, request, response, signup=False):
    guard(request)
    email = body.email.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(422, "Enter a valid email address")
    now = time.time()
    with _lock:
        for key in list(_attempts):
            if _attempts[key][1] < now:
                del _attempts[key]
        count, expires = _attempts.get(email, (0, now + 900))
        if count >= 10:
            raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
        _attempts[email] = (count + 1, expires)
    with Session() as db:
        account = db.scalar(select(Account).where(Account.email == email))
        if signup:
            if account:
                raise HTTPException(409, "An account already exists. Please sign in.")
            salt = secrets.token_hex(16)
            account = Account(
                id=str(uuid.uuid4()),
                email=email,
                name=body.name.strip() or "Movie lover",
                password=salt + ":" + password_hash(body.password, salt),
            )
            db.add(account)
            try:
                db.flush()
            except IntegrityError:
                raise HTTPException(409, "An account already exists. Please sign in.")
        else:
            salt, expected = account.password.split(":") if account else ("00" * 16, "00" * 64)
            valid = hmac.compare_digest(password_hash(body.password, salt), expected)
            if not account or not valid:
                raise HTTPException(401, "Email or password is incorrect")
        token = secrets.token_urlsafe(32)
        db.execute(delete(AccountSession).where(AccountSession.expires < int(now)))
        old = request.cookies.get(COOKIE)
        if old:
            db.execute(
                delete(AccountSession).where(
                    AccountSession.token_hash == hashlib.sha256(old.encode()).hexdigest()
                )
            )
        db.add(
            AccountSession(
                token_hash=hashlib.sha256(token.encode()).hexdigest(),
                account_id=account.id,
                expires=int(now) + 604800,
            )
        )
        db.commit()
        with _lock:
            _attempts.pop(email, None)
        response.set_cookie(
            # Session cookie never contains the password or account data.
            COOKIE,
            token,
            max_age=604800,
            httponly=True,
            samesite="lax",
            secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
            path="/",
        )
        return {"name": account.name, "email": account.email}


@router.get("/config")
def config():
    return {"local_accounts": enabled()}


@router.post("/signup")
def signup(body: Credentials, request: Request, response: Response):
    return authenticate(body, request, response, signup=True)


@router.post("/login")
def login(body: Credentials, request: Request, response: Response):
    return authenticate(body, request, response)


@router.get("/session")
def session(request: Request):
    account = account_for(request.cookies.get(COOKIE))
    return {"user": {"name": account.name, "email": account.email} if account else None}


@router.post("/logout")
def logout(request: Request, response: Response):
    guard(request)
    token = request.cookies.get(COOKIE)
    if token:
        with Session() as db:
            db.execute(
                delete(AccountSession).where(
                    AccountSession.token_hash == hashlib.sha256(token.encode()).hexdigest()
                )
            )
            db.commit()
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=10, max_length=128)


@router.post("/password")
def change_password(body: PasswordChange, request: Request):
    guard(request)
    token = request.cookies.get(COOKIE)
    account = account_for(token)
    if not account:
        raise HTTPException(401, "Sign in to change your password")
    salt, expected = account.password.split(":")
    if not hmac.compare_digest(password_hash(body.current_password, salt), expected):
        raise HTTPException(401, "Current password is incorrect")
    with Session() as db:
        current = db.get(Account, account.id)
        salt = secrets.token_hex(16)
        current.password = salt + ":" + password_hash(body.new_password, salt)
        db.execute(
            delete(AccountSession).where(
                AccountSession.account_id == account.id,
                AccountSession.token_hash != hashlib.sha256(token.encode()).hexdigest(),
            )
        )
        db.commit()
    return {"ok": True}
