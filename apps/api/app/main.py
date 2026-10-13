import os
import secrets
import json
import random
import hashlib
from contextlib import asynccontextmanager
from collections import Counter
from typing import Literal
from starlette.concurrency import run_in_threadpool
import httpx
from fastapi import FastAPI, HTTPException, Depends, Header, Query, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import defer
from starlette.responses import JSONResponse
from threading import Lock, BoundedSemaphore
import time
from redis import Redis
from .db import Session, Movie, Interaction, Event, UserProfile, Account, engine
from .catalog import seed
from .recommender import rank, dna, encode, latent_model
from .local_auth import router as auth_router, account_for

DEMO = os.getenv("DEMO_MODE", "true").lower() == "true"
redis = Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379"), socket_connect_timeout=0.2, socket_timeout=0.2
)


@asynccontextmanager
async def lifespan(app):
    if not DEMO and not all(os.getenv(key) for key in ("SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY")):
        raise RuntimeError("Production requires Supabase auth")
    seed()
    yield


app = FastAPI(title="CINEVERSE API", version="1.0.0", lifespan=lifespan)

app.include_router(auth_router)
_artwork_slots = BoundedSemaphore(3)


@app.get("/movies/{movie_id}/artwork")
async def recover_artwork(movie_id: int):
    from .artwork import public_artwork, apply_artwork

    with Session() as db:
        movie = db.get(Movie, movie_id)
        if movie is None:
            raise HTTPException(404, "Movie not found")
        tmdb_id, previous = movie.tmdb_id, movie.poster
    recovered = None
    if _artwork_slots.acquire(blocking=False):
        try:
            recovered = await run_in_threadpool(public_artwork, tmdb_id)
        except httpx.HTTPError:
            pass
        finally:
            _artwork_slots.release()
    if recovered:
        apply_artwork(movie_id, recovered)
    return {"poster": recovered["poster"] if recovered else previous}


app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Demo-Token"],
)
_redis_retry_after = 0.0
_buckets = {}
_bucket_lock = Lock()


def rate_count(key, minute):
    global _redis_retry_after
    if time.monotonic() >= _redis_retry_after:
        try:
            count = redis.incr(key)
            if count == 1:
                redis.expire(key, 65)
            return count
        except Exception:
            _redis_retry_after = time.monotonic() + 30
    with _bucket_lock:
        for old in list(_buckets):
            if not old.endswith(":" + str(minute)):
                del _buckets[old]
        _buckets[key] = _buckets.get(key, 0) + 1
        return _buckets[key]


@app.middleware("http")
async def request_limits(request, call_next):
    origin = request.headers.get("origin")
    if (
        request.method not in ("GET", "HEAD", "OPTIONS")
        and request.cookies.get("cineverse_session")
        and origin
        and origin not in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    ):
        return JSONResponse({"detail": "Untrusted origin"}, status_code=403)
    if (
        request.headers.get("content-length", "0").isdigit()
        and int(request.headers.get("content-length", "0")) > 16384
    ):
        return JSONResponse({"detail": "Request too large"}, status_code=413)
    ip = request.client.host if request.client else "unknown"
    minute = int(time.time() // 60)
    key = f"rate:{ip}:{minute}"
    count = await run_in_threadpool(rate_count, key, minute)
    if count > 180:
        return JSONResponse(
            {"detail": "Too many requests"}, status_code=429, headers={"Retry-After": "60"}
        )
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if request.url.path.startswith(("/auth", "/me", "/session")):
        response.headers["Cache-Control"] = "private, no-store"
    return response


def user(
    authorization: str | None = Header(None),
    x_demo_token: str | None = Header(None),
    cineverse_session: str | None = Cookie(None),
):
    if authorization:
        if not os.getenv("SUPABASE_URL"):
            raise HTTPException(401, "Authentication not configured")
        try:
            r = httpx.get(
                os.environ["SUPABASE_URL"] + "/auth/v1/user",
                headers={
                    "Authorization": authorization,
                    "apikey": os.environ["SUPABASE_PUBLISHABLE_KEY"],
                },
                timeout=10,
            )
            if r.status_code != 200:
                raise HTTPException(401, "Invalid or expired session")
            return r.json()["id"]
        except httpx.HTTPError:
            raise HTTPException(503, "Authentication service unavailable")
    if cineverse_session:
        account = account_for(cineverse_session)
        if not account:
            raise HTTPException(401, "Session expired. Please sign in again.")
        return "local:" + account.id
    if DEMO and x_demo_token and len(x_demo_token) == 64:
        return "demo:" + hashlib.sha256(x_demo_token.encode()).hexdigest()[:40]
    raise HTTPException(401, "Sign in or start a demo session")


def admin(uid=Depends(user)):
    if uid not in os.getenv("ADMIN_USER_IDS", "").split(","):
        raise HTTPException(403, "Administrator access required")
    return uid


def serialize(m, score=None, reasons=None):
    d = {c.name: getattr(m, c.name) for c in Movie.__table__.columns if c.name != "embedding"}
    d["dna"] = dna(m)
    d["match"] = score
    d["reasons"] = reasons or []
    return d


@app.get("/health")
def health():
    with Session() as db:
        count = db.scalar(select(func.count(Movie.id)))
    try:
        redis.ping()
        cache = "online"
    except Exception:
        cache = "unavailable; direct database fallback"
    return {
        "status": "ok",
        "movies": count,
        "demo": DEMO,
        "cache": cache,
        "embeddings": os.getenv(
            "EMBEDDING_MODEL",
            "latent semantic (96 dimensions)"
            if latent_model()
            else "concept-expanded lexical fallback",
        ),
    }


@app.post("/session/demo")
def demo():
    if not DEMO:
        raise HTTPException(404)
    return {"token": secrets.token_hex(32)}


@app.get("/movies")
def movies(
    q: str = Query("", max_length=300),
    genre: str = "",
    offset: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    year_from: int = 0,
    year_to: int = 2100,
    max_runtime: int = 0,
    min_score: float = 0,
    sort: Literal["popular", "rating", "newest"] = "popular",
):
    key = f"catalog:v2:{q}:{genre}:{offset}:{limit}:{year_from}:{year_to}:{max_runtime}:{min_score}:{sort}"
    try:
        cached = redis.get(key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    with Session() as db:
        stmt = select(Movie).options(defer(Movie.embedding)).order_by(Movie.votes.desc())
        if q:
            stmt = stmt.where(Movie.title.ilike("%" + q + "%"))
        rows = db.scalars(stmt).all()
        if genre:
            rows = [m for m in rows if genre in m.genres]
        rows = [
            m
            for m in rows
            if year_from <= m.year <= year_to
            and m.score >= min_score
            and (not max_runtime or (m.runtime and m.runtime <= max_runtime))
        ]
        if sort == "rating":
            rows.sort(key=lambda m: (m.score, m.votes), reverse=True)
        elif sort == "newest":
            rows.sort(key=lambda m: (m.year, m.votes), reverse=True)
        result = {
            "total": len(rows),
            "items": [serialize(m) for m in rows[offset : offset + limit]],
        }
    try:
        redis.setex(key, 300, json.dumps(result))
    except Exception:
        pass
    return result


@app.get("/categories")
def categories():
    with Session() as db:
        rows = db.execute(
            select(Movie.id, Movie.genres, Movie.poster).order_by(Movie.votes.desc())
        ).all()
    groups = {}
    for movie_id, genres, poster in rows:
        for genre in genres:
            if genre == "(no genres listed)":
                continue
            group = groups.setdefault(genre, {"name": genre, "count": 0, "poster": None})
            group["count"] += 1
            if not group["poster"] and poster:
                group["poster"] = poster
                group["movie_id"] = movie_id
    return {"items": sorted(groups.values(), key=lambda g: g["count"], reverse=True)}


@app.get("/movies/{movie_id}")
def movie(movie_id: int):
    with Session() as db:
        m = db.get(Movie, movie_id)
        if not m:
            raise HTTPException(404, "Movie not found")
        return serialize(m)


class Discover(BaseModel):
    genre: str = Field("", max_length=40)
    year_from: int = Field(0, ge=0, le=2100)
    year_to: int = Field(2100, ge=0, le=2100)
    min_score: float = Field(0, ge=0, le=5)
    query: str = Field("", max_length=300)
    mood: Literal["", "Mind-bending", "Comfort", "Adrenaline", "Heartfelt", "Dark", "Wonder"] = ""
    fusion: list[int] = Field(default_factory=list, max_length=3)
    novelty: float = Field(0.25, ge=0, le=1)
    max_runtime: int | None = Field(None, ge=1, le=600)
    exclude_genre: str | None = Field(None, max_length=40)
    mode: Literal["discover", "gems", "pick", "mystery", "fusion"] = "discover"
    limit: int = Field(24, ge=1, le=100)


@app.post("/discover")
def discover(body: Discover, uid=Depends(user)):
    with Session() as db:
        feedback = db.scalars(select(Interaction).where(Interaction.user_id == uid)).all()
        preferences = db.get(UserProfile, uid)
        if engine.dialect.name == "postgresql" and body.query:
            # ANN candidates plus popularity and feedback anchors; reranking applies hard filters.
            nearest = db.scalars(
                select(Movie)
                .where(Movie.embedding.is_not(None))
                .order_by(Movie.embedding.cosine_distance(encode([body.query])[0]))
                .limit(2000)
            ).all()
            popular = db.scalars(select(Movie).order_by(Movie.votes.desc()).limit(1000)).all()
            anchors = db.scalars(
                select(Movie).where(Movie.id.in_([i.movie_id for i in feedback] + body.fusion))
            ).all()
            rows = list({m.id: m for m in nearest + popular + anchors}.values())
        else:
            rows = db.scalars(select(Movie)).all()
        results = rank(
            rows,
            feedback,
            body.query,
            body.mood,
            body.fusion,
            body.novelty,
            body.max_runtime,
            body.exclude_genre,
        )
        excluded = {
            i.movie_id
            for i in feedback
            if i.dismissed or (i.watched and (preferences is None or preferences.hide_watched))
        }
        results = [r for r in results if r[0].id not in excluded]
        if preferences and preferences.genres:
            results = [
                (
                    m,
                    score
                    + 0.15 * len(set(m.genres) & set(preferences.genres)) / max(1, len(m.genres)),
                    reasons
                    + (
                        ["Matches your preferred genres"]
                        if set(m.genres) & set(preferences.genres)
                        else []
                    ),
                )
                for m, score, reasons in results
            ]
            results.sort(key=lambda r: r[1], reverse=True)
        results = [
            r
            for r in results
            if (not body.genre or body.genre in r[0].genres)
            and body.year_from <= r[0].year <= body.year_to
            and r[0].score >= body.min_score
        ]
        if body.mode == "gems":
            results = [r for r in results if 5 <= r[0].votes < 50 and r[0].score >= 3.5]
        if body.mode in ("pick", "mystery"):
            results = random.sample(results[:30], min(1, len(results)))
        db.add(Event(user_id=uid, kind=body.mode, movie_id=None))
        db.commit()
        return {
            "items": [serialize(*r) for r in results[: body.limit]],
            "total": len(results),
            "mystery": body.mode == "mystery",
        }


class Feedback(BaseModel):
    rating: float | None = Field(None, ge=0.5, le=5)
    watchlist: bool | None = None
    favorite: bool | None = None
    watched: bool | None = None
    dismissed: bool | None = None


@app.post("/me/movies/{movie_id}")
def feedback(movie_id: int, body: Feedback, uid=Depends(user)):
    with Session() as db:
        if not db.get(Movie, movie_id):
            raise HTTPException(404)
        changes = body.model_dump(exclude_unset=True)
        for key, value in changes.items():
            if key != "rating" and value is None:
                raise HTTPException(422, "Boolean cannot be null")
        if not changes:
            return {"ok": True}
        # Atomic upsert prevents concurrent rating/list writes losing fields or racing inserts.
        if engine.dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import insert
        else:
            from sqlalchemy.dialects.sqlite import insert
        statement = insert(Interaction).values(
            user_id=uid,
            movie_id=movie_id,
            rating=body.rating,
            watchlist=body.watchlist or False,
            favorite=body.favorite or False,
            watched=body.watched or False,
            dismissed=body.dismissed or False,
        )
        db.execute(
            statement.on_conflict_do_update(index_elements=["user_id", "movie_id"], set_=changes)
        )
        db.add(Event(user_id=uid, kind="feedback", movie_id=movie_id))
        db.commit()
        return {"ok": True}


@app.get("/me")
def me(uid=Depends(user)):
    with Session() as db:
        rows = db.scalars(select(Interaction).where(Interaction.user_id == uid)).all()
        movie_by_id = {
            m.id: m
            for m in db.scalars(
                select(Movie)
                .options(defer(Movie.embedding))
                .where(Movie.id.in_([i.movie_id for i in rows]))
            )
        }
        genres = Counter()
        items = []
        for i in rows:
            m = movie_by_id.get(i.movie_id)
            if not m:
                continue
            if i.favorite or (i.rating and i.rating >= 3.5):
                genres.update(m.genres)
            items.append(
                {
                    "movie": serialize(m),
                    "rating": i.rating,
                    "watchlist": i.watchlist,
                    "favorite": i.favorite,
                    "watched": i.watched,
                    "dismissed": i.dismissed,
                }
            )
        return {
            "items": items,
            "dna": dict(genres.most_common()),
            "user_id": uid,
            "admin": uid in os.getenv("ADMIN_USER_IDS", "").split(","),
        }


class ProfileInput(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    bio: str = Field("", max_length=300)
    avatar: Literal["orbit", "star", "moon", "film", "comet", "sun"] = "orbit"
    genres: list[str] = Field(default_factory=list, max_length=10)
    hide_watched: bool = True


@app.get("/me/profile")
def get_profile(uid=Depends(user)):
    with Session() as db:
        p = db.get(UserProfile, uid)
        account = db.get(Account, uid[6:]) if uid.startswith("local:") else None
        return {
            "name": p.name if p else account.name if account else "Movie lover",
            "bio": p.bio if p else "",
            "avatar": p.avatar if p else "orbit",
            "genres": p.genres if p else [],
            "hide_watched": p.hide_watched if p else True,
            "email": account.email if account else None,
            "guest": uid.startswith("demo:"),
            "local_account": account is not None,
        }


@app.post("/me/profile")
def update_profile(body: ProfileInput, uid=Depends(user)):
    name = body.name.strip()
    if not name:
        raise HTTPException(422, "Please enter a display name")
    valid_genres = {c["name"] for c in categories()["items"]}
    if set(body.genres) - valid_genres:
        raise HTTPException(422, "Choose genres from the catalog")
    with Session() as db:
        from sqlalchemy.dialects.postgresql import insert as pg_insert
        from sqlalchemy.dialects.sqlite import insert as sqlite_insert

        values = {**body.model_dump(), "name": name, "genres": list(dict.fromkeys(body.genres))}
        statement = (pg_insert if engine.dialect.name == "postgresql" else sqlite_insert)(
            UserProfile
        ).values(user_id=uid, **values)
        db.execute(statement.on_conflict_do_update(index_elements=["user_id"], set_=values))
        if uid.startswith("local:"):
            account = db.get(Account, uid[6:])
            if account:
                account.name = name
        db.commit()
    return get_profile(uid)


@app.get("/me/export")
def export_data(uid=Depends(user)):
    return {
        "format": "cineverse-export-v1",
        "exported_at": int(time.time()),
        "profile": get_profile(uid),
        "collection": me(uid)["items"],
    }


class Group(BaseModel):
    favorites: list[list[int]] = Field(min_length=2, max_length=8)


@app.post("/group")
def group(body: Group, uid=Depends(user)):
    if any(len(x) > 20 or not x for x in body.favorites):
        raise HTTPException(422, "Each person needs 1–20 favorite movie IDs")
    with Session() as db:
        movies = db.scalars(select(Movie)).all()
        if {i for picks in body.favorites for i in picks} - {m.id for m in movies}:
            raise HTTPException(422, "A selected movie does not exist")
        scores = []
        for picks in body.favorites:
            f = [Interaction(movie_id=i, rating=5, favorite=True) for i in picks]
            scores.append({m.id: s for m, s, _ in rank(movies, f)})
        excluded = {i for p in body.favorites for i in p}
        excluded.update(
            db.scalars(
                select(Interaction.movie_id).where(
                    Interaction.user_id == uid, Interaction.dismissed.is_(True)
                )
            ).all()
        )
        ranked = sorted(
            ((m, min(s.get(m.id, 0) for s in scores)) for m in movies if m.id not in excluded),
            key=lambda x: x[1],
            reverse=True,
        )
        return {
            "items": [
                serialize(m, s, ["Balances the least-satisfied participant"])
                for m, s in ranked[:24]
            ]
        }


@app.get("/admin/analytics")
def analytics(uid=Depends(admin)):
    with Session() as db:
        return {
            "movies": db.scalar(select(func.count(Movie.id))),
            "users": db.scalar(select(func.count(func.distinct(Interaction.user_id)))),
            "events": dict(
                db.execute(select(Event.kind, func.count(Event.id)).group_by(Event.kind)).all()
            ),
        }


@app.post("/admin/hydrate")
def enqueue(uid=Depends(admin)):
    try:
        redis.lpush("cineverse:jobs", json.dumps({"kind": "hydrate", "limit": 500}))
    except Exception:
        raise HTTPException(503, "Worker queue unavailable")
    return {"queued": True}


@app.get("/catalog/live")
def live_catalog(
    q: str = Query("", max_length=200), page: int = Query(1, ge=1, le=500), uid=Depends(user)
):
    from .catalog import live_search

    try:
        ids = live_search(q, page)
    except httpx.HTTPError:
        fallback = movies(q=q, genre="", offset=0, limit=24)
        return {
            **fallback,
            "source": "local",
            "message": "Live catalog is temporarily unavailable. Showing local matches.",
        }
    if ids is None:
        fallback = movies(q=q, genre="", offset=0, limit=24)
        return {
            **fallback,
            "source": "local",
            "message": "TMDB is not configured. Showing local matches.",
        }
    with Session() as db:
        found = {m.id: m for m in db.scalars(select(Movie).where(Movie.id.in_(ids)))}
        return {
            "items": [serialize(found[i]) for i in ids if i in found],
            "total": len(ids),
            "source": "tmdb",
        }
