"""Join a TMDB metadata CSV to MovieLens by stable TMDB ID, without API credentials."""

import argparse
import csv
import hashlib
import io
import json
import re
import zipfile
from contextlib import ExitStack
from pathlib import Path


def enrich(
    source: Path,
    data: Path,
    refresh=False,
    source_url="https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset",
    snapshot="TMDB metadata through July 2017",
):
    catalog_path = data / "catalog.json"
    movies = json.loads(catalog_path.read_text(encoding="utf-8"))
    by_tmdb = {str(m["tmdb_id"]): m for m in movies if m.get("tmdb_id")}
    matched = set()
    artwork_path = data / "artwork.json"
    artwork = json.loads(artwork_path.read_text()) if artwork_path.exists() else {}

    def merge(row):
        movie = by_tmdb.get(row.get("id", ""))
        if movie is None:
            return
        matched.add(movie["id"])
        poster = row.get("poster_path", "")
        if (refresh or not movie.get("poster")) and re.fullmatch(
            r"/[A-Za-z0-9_-]+\.(?:jpg|png|webp)", poster
        ):
            movie["poster"] = poster
            artwork[str(movie["id"])] = poster
        if (refresh or not movie.get("overview")) and row.get("overview"):
            movie["overview"] = row["overview"]
        try:
            runtime = int(float(row.get("runtime", "0")))
            if (refresh or not movie.get("runtime")) and 0 < runtime <= 1000:
                movie["runtime"] = runtime
        except (ValueError, TypeError, OverflowError):
            pass

    # Stream large metadata snapshots instead of retaining a million rows in memory.
    csv.field_size_limit(10 * 1024 * 1024)
    with ExitStack() as stack:
        if zipfile.is_zipfile(source):
            archive = stack.enter_context(zipfile.ZipFile(source))
            name = next(n for n in archive.namelist() if n.endswith(".csv"))
            stream = stack.enter_context(io.TextIOWrapper(archive.open(name), encoding="utf-8-sig"))
        else:
            stream = stack.enter_context(source.open(encoding="utf-8-sig", newline=""))
        for row in csv.DictReader(stream):
            merge(row)
    artwork_path.write_text(json.dumps(artwork, indent=2))
    catalog_path.write_text(json.dumps(movies, ensure_ascii=False), encoding="utf-8")
    report = {
        "source": source_url,
        "source_sha256": file_hash(source),
        "snapshot": snapshot,
        "matched": len(matched),
        "movies": len(movies),
        "with_poster": sum(bool(m.get("poster")) for m in movies),
        "with_overview": sum(bool(m.get("overview")) for m in movies),
        "with_runtime": sum(bool(m.get("runtime")) for m in movies),
    }
    (data / "metadata-report.json").write_text(json.dumps(report, indent=2))
    return report


def file_hash(source):
    digest = hashlib.sha256()
    with source.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--data", type=Path, default=Path("data"))
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument(
        "--source-url", default="https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset"
    )
    parser.add_argument("--snapshot", default="TMDB metadata through July 2017")
    args = parser.parse_args()
    print(
        json.dumps(
            enrich(args.source, args.data, args.refresh, args.source_url, args.snapshot), indent=2
        )
    )
