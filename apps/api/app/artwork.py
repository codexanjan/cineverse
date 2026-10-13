"""Recover absent/stale artwork from a film's public TMDB metadata, with bounded requests."""

from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from functools import lru_cache
from urllib.parse import urlparse
import json
import re
import time
import httpx
from sqlalchemy import select
from .db import Session, Movie
from .catalog import DATA


class PageMetadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.values = {}

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "meta" and data.get("property", "").startswith("og:"):
            self.values[data["property"]] = data.get("content", "")


@lru_cache(maxsize=8192)
def public_artwork(tmdb_id):
    if not tmdb_id:
        return None
    with httpx.Client(timeout=12, follow_redirects=True) as client:
        response = client.get(
            f"https://www.themoviedb.org/movie/{int(tmdb_id)}",
            headers={"Accept-Language": "en-US,en;q=0.9"},
        )
        # Never retry access denials or attempt to defeat a provider's bot controls.
        if response.status_code != 200:
            return None
    metadata = PageMetadata()
    metadata.feed(response.text)
    image = urlparse(metadata.values.get("og:image", ""))
    if image.hostname not in {"image.tmdb.org", "media.themoviedb.org"}:
        return None
    path = "/" + image.path.rsplit("/", 1)[-1]
    if not re.fullmatch(r"/[A-Za-z0-9_-]+\.(jpg|png|webp)", path):
        return None
    return {"poster": path, "overview": metadata.values.get("og:description", "")}


def apply_artwork(movie_id, metadata):
    if not metadata:
        return
    with Session() as db:
        movie = db.get(Movie, movie_id)
        if movie:
            movie.poster = metadata["poster"]
            db.commit()


def fill_missing(limit=300):
    with Session() as db:
        missing = db.execute(
            select(Movie.id, Movie.tmdb_id)
            .where(Movie.poster.is_(None), Movie.tmdb_id.is_not(None))
            .limit(limit)
        ).all()
    recovered = {}

    def fetch(row):
        time.sleep(0.4)
        try:
            return row.id, public_artwork(row.tmdb_id)
        except httpx.HTTPError:
            return row.id, None

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(fetch, row) for row in missing]
        for n, future in enumerate(as_completed(futures), 1):
            mid, metadata = future.result()
            if metadata:
                apply_artwork(mid, metadata)
                recovered[str(mid)] = metadata["poster"]
            if n % 25 == 0:
                print(f"Checked {n}/{len(missing)}; recovered {len(recovered)}", flush=True)
    artwork_path = DATA / "artwork.json"
    artwork = json.loads(artwork_path.read_text()) if artwork_path.exists() else {}
    artwork.update(recovered)
    artwork_path.write_text(json.dumps(artwork, indent=2))
    catalog_path = DATA / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    for movie in catalog:
        if str(movie["id"]) in recovered:
            movie["poster"] = recovered[str(movie["id"])]
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")
    print({"checked": len(missing), "recovered": len(recovered)}, flush=True)


if __name__ == "__main__":
    fill_missing()
