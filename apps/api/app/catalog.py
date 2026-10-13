import json
import os
import time
from pathlib import Path
import httpx
from sqlalchemy import select, or_
from .db import Session, Movie
from .recommender import encode

DATA = Path(os.getenv("DATA_DIR", "../../data"))


def seed():
    with Session() as db:
        if db.scalar(select(Movie.id).limit(1)):
            return
        rows = json.loads((DATA / "catalog.json").read_text(encoding="utf-8"))
        artwork = (
            json.loads((DATA / "artwork.json").read_text())
            if (DATA / "artwork.json").exists()
            else {}
        )
        for row in rows:
            row["poster"] = artwork.get(str(row["id"]), row.get("poster"))
        vectors = encode(
            [r["title"] + " " + " ".join(r["genres"]) + " " + r.get("overview", "") for r in rows]
        )
        db.add_all([Movie(**r, embedding=v) for r, v in zip(rows, vectors)])
        db.commit()


def hydrate(limit=1000):
    token = os.getenv("TMDB_TOKEN")
    if not token:
        return {"updated": 0, "status": "TMDB_TOKEN not configured"}
    updated = 0
    with (
        Session() as db,
        httpx.Client(timeout=20, headers={"Authorization": f"Bearer {token}"}) as client,
    ):
        movies = db.scalars(
            select(Movie)
            .where(Movie.tmdb_id.is_not(None), or_(Movie.overview == "", Movie.runtime.is_(None)))
            .order_by(Movie.votes.desc())
            .limit(limit)
        ).all()
        for m in movies:
            for attempt in range(4):
                res = client.get(f"https://api.themoviedb.org/3/movie/{m.tmdb_id}")
                if res.status_code != 429:
                    break
                time.sleep(min(60, int(res.headers.get("Retry-After", "5"))))
            if res.status_code in (401, 403):
                raise RuntimeError("TMDB credentials rejected")
            if res.status_code != 200:
                continue
            d = res.json()
            m.overview = d.get("overview") or ""
            m.runtime = d.get("runtime") or None
            m.poster = d.get("poster_path")
            m.backdrop = d.get("backdrop_path")
            m.embedding = encode([m.title + " " + " ".join(m.genres) + " " + m.overview])[0]
            db.commit()
            updated += 1
            time.sleep(0.04)
    return {"updated": updated, "status": "complete"}


def import_catalog():
    rows = json.loads((DATA / "catalog.json").read_text(encoding="utf-8"))
    artwork = (
        json.loads((DATA / "artwork.json").read_text()) if (DATA / "artwork.json").exists() else {}
    )
    with Session() as db:
        for start in range(0, len(rows), 250):
            batch = rows[start : start + 250]
            existing = {
                m.id: m
                for m in db.scalars(select(Movie).where(Movie.id.in_([r["id"] for r in batch])))
            }
            vectors = encode(
                [
                    r["title"] + " " + " ".join(r["genres"]) + " " + r.get("overview", "")
                    for r in batch
                ]
            )
            for r, v in zip(batch, vectors):
                m = existing.get(r["id"])
                if m:
                    m.score = r["score"]
                    m.votes = r["votes"]
                    m.poster = artwork.get(str(m.id)) or m.poster or r.get("poster")
                    changed = False
                    if r.get("overview") and m.overview != r["overview"]:
                        m.overview = r["overview"]
                        changed = True
                    if r.get("runtime"):
                        m.runtime = r["runtime"]
                    if changed:
                        m.embedding = v
                else:
                    r["poster"] = artwork.get(str(r["id"]), r.get("poster"))
                    db.add(Movie(**r, embedding=v))
            db.commit()
    return {"imported": len(rows)}


def reembed():
    with Session() as db:
        ids = db.scalars(select(Movie.id)).all()
        for start in range(0, len(ids), 128):
            batch = db.scalars(select(Movie).where(Movie.id.in_(ids[start : start + 128]))).all()
            vectors = encode([m.title + " " + " ".join(m.genres) + " " + m.overview for m in batch])
            for m, v in zip(batch, vectors):
                m.embedding = v
            db.commit()
    return {"embedded": len(ids)}


if __name__ == "__main__":
    import argparse

    p = argparse.ArgumentParser()
    p.add_argument("--hydrate", type=int, default=0)
    p.add_argument("--import-catalog", action="store_true")
    p.add_argument("--reembed", action="store_true")
    a = p.parse_args()
    print(
        hydrate(a.hydrate)
        if a.hydrate
        else import_catalog()
        if a.import_catalog
        else reembed()
        if a.reembed
        else seed()
    )


def live_search(query="", page=1):
    """Import current TMDB search/popular results, retaining MovieLens identity when linked."""
    token = os.getenv("TMDB_TOKEN")
    if not token:
        return None
    genre_map = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Children",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Musical",
        9648: "Mystery",
        10749: "Romance",
        878: "Sci-Fi",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western",
    }
    with httpx.Client(timeout=15, headers={"Authorization": f"Bearer {token}"}) as client:
        route = "search/movie" if query else "movie/popular"
        response = client.get(
            "https://api.themoviedb.org/3/" + route,
            params={"query": query, "page": page, "include_adult": "false"},
        )
        response.raise_for_status()
        results = response.json()["results"]
    imported = []
    with Session() as db:
        if db.bind.dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import insert
        else:
            from sqlalchemy.dialects.sqlite import insert
        for row in results:
            if row.get("adult"):
                continue
            existing = db.scalar(select(Movie).where(Movie.tmdb_id == row["id"]))
            mid = existing.id if existing else -row["id"]
            genres = [genre_map[g] for g in row.get("genre_ids", []) if g in genre_map]
            fields = {
                "title": row["title"],
                "genres": genres,
                "overview": row.get("overview", ""),
                "poster": row.get("poster_path"),
                "backdrop": row.get("backdrop_path"),
            }
            fields["embedding"] = encode(
                [fields["title"] + " " + " ".join(genres) + " " + fields["overview"]]
            )[0]
            initial = {
                **fields,
                "id": mid,
                "tmdb_id": row["id"],
                "year": int(row["release_date"][:4]) if row.get("release_date") else 0,
                "runtime": None,
                "score": row.get("vote_average", 0) / 2,
                "votes": row.get("vote_count", 0),
            }
            stmt = insert(Movie).values(**initial)
            db.execute(stmt.on_conflict_do_update(index_elements=["id"], set_=fields))
            imported.append(mid)
        db.commit()
    return imported
