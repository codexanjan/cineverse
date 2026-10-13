import argparse
import csv
import json
import re
from pathlib import Path
from collections import defaultdict
import numpy as np

p = argparse.ArgumentParser(
    description="MovieLens small or 32M ingestion and item latent-factor training"
)
p.add_argument("--source", type=Path, required=True)
p.add_argument("--output", type=Path, default=Path("data"))
p.add_argument("--factors", type=int, default=64)
a = p.parse_args()
a.output.mkdir(parents=True, exist_ok=True)
links = {
    int(r["movieId"]): int(r["tmdbId"]) if r["tmdbId"] else None
    for r in csv.DictReader((a.source / "links.csv").open(encoding="utf-8"))
}
movies = list(csv.DictReader((a.source / "movies.csv").open(encoding="utf-8")))
ids = np.array([int(m["movieId"]) for m in movies])
index = {int(v): i for i, v in enumerate(ids)}
# Two passes avoid millions of Python tuples for the 32M dataset.
users = {}
count = 0
stats = defaultdict(lambda: [0.0, 0])
with (a.source / "ratings.csv").open() as f:
    for r in csv.DictReader(f):
        users.setdefault(int(r["userId"]), len(users))
        count += 1
        s = stats[int(r["movieId"])]
        s[0] += float(r["rating"])
        s[1] += 1
rows = np.empty(count, dtype=np.int32)
cols = np.empty(count, dtype=np.int32)
values = np.empty(count, dtype=np.float32)
with (a.source / "ratings.csv").open() as f:
    for i, r in enumerate(csv.DictReader(f)):
        rows[i] = users[int(r["userId"])]
        cols[i] = index[int(r["movieId"])]
        values[i] = float(r["rating"])
# Deterministic holdout: keep 10% of each user's observations out of fitting.
rng = np.random.default_rng(42)
test = rng.random(count) < 0.1
# Biased explicit-feedback matrix factorization, trained in bounded mini-batches.
# This works with the same two-pass ingestion for the full 32M CSV.
k = a.factors
uf = rng.normal(0, 0.08, (len(users), k)).astype(np.float32)
factors = rng.normal(0, 0.08, (len(ids), k)).astype(np.float32)
ub = np.zeros(len(users), np.float32)
ib = np.zeros(len(ids), np.float32)
mean = float(values[~test].mean())
train_indices = np.flatnonzero(~test)
best = float("inf")
history = []
for epoch in range(18):
    rng.shuffle(train_indices)
    lr = 0.015 * (0.96**epoch)
    for start in range(0, len(train_indices), 2048):
        ix = train_indices[start : start + 2048]
        ru = rows[ix]
        ci = cols[ix]
        u0 = uf[ru].copy()
        i0 = factors[ci].copy()
        err = np.clip(values[ix] - (mean + ub[ru] + ib[ci] + np.einsum("ij,ij->i", u0, i0)), -5, 5)
        np.add.at(ub, ru, lr * (err - 0.03 * ub[ru]))
        np.add.at(ib, ci, lr * (err - 0.03 * ib[ci]))
        np.add.at(uf, ru, lr * (err[:, None] * i0 - 0.04 * u0))
        np.add.at(factors, ci, lr * (err[:, None] * u0 - 0.04 * i0))
    squared = 0.0
    held = np.flatnonzero(test)
    for start in range(0, len(held), 8192):
        ix = held[start : start + 8192]
        pred = np.clip(
            mean
            + ub[rows[ix]]
            + ib[cols[ix]]
            + np.einsum("ij,ij->i", uf[rows[ix]], factors[cols[ix]]),
            0.5,
            5,
        )
        squared += float(np.sum((pred - values[ix]) ** 2))
    rmse = float(np.sqrt(squared / len(held)))
    history.append(rmse)
    print(f"Epoch {epoch + 1}: validation RMSE {rmse:.4f}", flush=True)
    if rmse < best:
        best = rmse
        normalized = factors / np.maximum(np.linalg.norm(factors, axis=1, keepdims=True), 1e-8)
        np.savez_compressed(
            a.output / "model.npz",
            ids=ids,
            factors=normalized.astype(np.float32),
            raw_factors=factors,
            item_bias=ib,
            mean=np.array(mean),
        )
metrics = {
    "dataset": a.source.name,
    "algorithm": "biased matrix factorization SGD",
    "ratings": count,
    "users": len(users),
    "movies": len(ids),
    "held_out": int(test.sum()),
    "validation_rmse": best,
    "mean_baseline_rmse": float(np.sqrt(np.mean((values[test] - mean) ** 2))),
    "epochs": len(history),
    "history": history,
    "note": "Deterministic random validation split, used for model selection; not an untouched test set. Serving folds in new users from signed ratings.",
}
(a.output / "training-report.json").write_text(json.dumps(metrics, indent=2))
catalog = []
for m in movies:
    mid = int(m["movieId"])
    s = stats[mid]
    year_match = re.search(r"\((\d{4})\)$", m["title"])
    catalog.append(
        {
            "id": mid,
            "title": re.sub(r"\s*\(\d{4}\)$", "", m["title"]),
            "year": int(year_match[1]) if year_match else 0,
            "genres": [] if m["genres"] == "(no genres listed)" else m["genres"].split("|"),
            "tmdb_id": links.get(mid),
            "overview": "",
            "poster": None,
            "backdrop": None,
            "runtime": None,
            "score": round(s[0] / s[1], 3) if s[1] else 0,
            "votes": s[1],
        }
    )
(a.output / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False), encoding="utf-8")
print(json.dumps(metrics, indent=2))
