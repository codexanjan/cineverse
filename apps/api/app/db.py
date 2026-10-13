import os
from sqlalchemy import create_engine, String, JSON, UniqueConstraint, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from pgvector.sqlalchemy import Vector

URL = os.getenv("DATABASE_URL", "sqlite:///./cineverse.db")
engine = create_engine(
    URL,
    connect_args={"check_same_thread": False} if URL.startswith("sqlite") else {},
    pool_pre_ping=True,
)
Session = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Movie(Base):
    __tablename__ = "movies"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(400), index=True)
    year: Mapped[int] = mapped_column(default=0)
    genres: Mapped[list] = mapped_column(JSON, default=list)
    overview: Mapped[str] = mapped_column(default="")
    tmdb_id: Mapped[int | None] = mapped_column(index=True)
    poster: Mapped[str | None]
    backdrop: Mapped[str | None]
    runtime: Mapped[int | None]
    score: Mapped[float] = mapped_column(default=0)
    votes: Mapped[int] = mapped_column(default=0)
    embedding: Mapped[list | None] = mapped_column(Vector(384).with_variant(JSON(), "sqlite"))


class Interaction(Base):
    __tablename__ = "interactions"
    __table_args__ = (UniqueConstraint("user_id", "movie_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(100), index=True)
    movie_id: Mapped[int] = mapped_column(index=True)
    rating: Mapped[float | None]
    watchlist: Mapped[bool] = mapped_column(default=False)
    favorite: Mapped[bool] = mapped_column(default=False)
    watched: Mapped[bool] = mapped_column(default=False, server_default="false")
    dismissed: Mapped[bool] = mapped_column(default=False, server_default="false")


class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(80), default="Movie lover")
    bio: Mapped[str] = mapped_column(String(300), default="")
    avatar: Mapped[str] = mapped_column(String(20), default="orbit")
    genres: Mapped[list] = mapped_column(JSON, default=list)
    hide_watched: Mapped[bool] = mapped_column(default=True)


class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    name: Mapped[str] = mapped_column(String(80))
    password: Mapped[str] = mapped_column(String(200))


class AccountSession(Base):
    __tablename__ = "account_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"))
    expires: Mapped[int]


class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String(100), index=True)
    kind: Mapped[str] = mapped_column(String(40))
    movie_id: Mapped[int | None]
