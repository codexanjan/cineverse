import os
import re
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer, TfidfVectorizer
import json
from functools import lru_cache

MOODS = {
    "Mind-bending": ["Sci-Fi", "Mystery", "Thriller"],
    "Comfort": ["Comedy", "Animation", "Children"],
    "Adrenaline": ["Action", "Adventure", "Thriller"],
    "Heartfelt": ["Drama", "Romance"],
    "Dark": ["Crime", "Horror", "Thriller"],
    "Wonder": ["Fantasy", "Adventure", "Sci-Fi"],
}
vectorizer = HashingVectorizer(n_features=384, alternate_sign=False, norm="l2", ngram_range=(1, 2))
_model = None


@lru_cache(maxsize=1)
def latent_model():
    folder = Path(os.getenv("DATA_DIR", "../../data"))
    if not (folder / "semantic.npz").exists():
        return None
    with np.load(folder / "semantic.npz") as data:
        tfidf = TfidfVectorizer(
            vocabulary=json.loads((folder / "vocabulary.json").read_text()),
            ngram_range=(1, 2),
            sublinear_tf=True,
        )
        tfidf.idf_ = data["idf"]
        return tfidf, data["components"]


def expand(text):
    concepts = {
        "space": "Sci-Fi Adventure",
        "mind-bending": "Sci-Fi Mystery Thriller",
        "funny": "Comedy",
        "cozy": "Comedy Animation",
        "comfort": "Comedy Children",
        "romantic": "Romance",
        "love": "Romance",
        "scary": "Horror",
        "dark": "Crime Thriller",
        "dreamy": "Fantasy",
        "magical": "Fantasy Adventure",
        "heartwarming": "Drama Comedy",
        "family": "Children Animation",
        "exciting": "Action Adventure",
        "suspense": "Thriller Mystery",
    }
    return text + " " + " ".join(v for k, v in concepts.items() if k in text.lower())


def encode(texts):
    global _model
    if os.getenv("EMBEDDING_MODEL"):
        if _model is None:
            from sentence_transformers import SentenceTransformer

            _model = SentenceTransformer(os.environ["EMBEDDING_MODEL"])
        vectors = _model.encode(texts, normalize_embeddings=True)
        if vectors.shape[1] != 384:
            raise ValueError(
                "Use a 384-dimensional sentence encoder, or migrate the vector schema first"
            )
        return vectors.tolist()
    latent = latent_model()
    if latent:
        tfidf, components = latent
        matrix = tfidf.transform([expand(t) for t in texts]) @ components.T
        matrix = matrix / np.maximum(np.linalg.norm(matrix, axis=1, keepdims=True), 1e-8)
        return np.pad(matrix, ((0, 0), (0, 384 - matrix.shape[1]))).tolist()
    return vectorizer.transform([expand(t) for t in texts]).toarray().tolist()


def dna(movie):
    return {
        name: round(sum(g in movie.genres for g in genres) / len(genres), 2)
        for name, genres in MOODS.items()
    }


def rank(
    movies,
    interactions,
    query="",
    mood="",
    fusion=None,
    novelty=0.25,
    max_runtime=None,
    exclude_genre=None,
):
    positive = {
        i.movie_id: (i.rating if i.rating is not None else 5) - 3
        for i in interactions
        if i.rating is not None or i.favorite
    }
    by_id = {m.id: m for m in movies}
    liked = [by_id[k] for k, v in positive.items() if v > 0 and k in by_id]
    weights = {}
    for m in liked:
        for g in m.genres:
            weights[g] = weights.get(g, 0) + positive[m.id]
    target = encode([query])[0] if query else None
    fusion_movies = [by_id[i] for i in (fusion or []) if i in by_id]
    if fusion_movies:
        target = np.mean(
            [
                m.embedding
                if m.embedding is not None
                else encode([m.title + " " + " ".join(m.genres)])[0]
                for m in fusion_movies
            ],
            axis=0,
        )
    cf = {}
    artifact = Path(os.getenv("MODEL_PATH", "../../data/model.npz"))
    if artifact.exists() and positive:
        with np.load(artifact) as data:
            ids, factors = data["ids"], data["factors"]
            ix = {int(v): j for j, v in enumerate(ids)}
            profile = sum(
                (factors[ix[k]] * v for k, v in positive.items() if k in ix),
                np.zeros(factors.shape[1]),
            )
            cf = dict(zip(ids.tolist(), (factors @ profile).tolist()))
    under = re.search(r"under\s+(\d+)\s*(hours?|h|minutes?|mins?)", query.lower())
    if under:
        max_runtime = int(under[1]) * (60 if under[2].startswith("h") else 1)
    excluded = [
        g
        for g in {g for m in movies for g in m.genres}
        if re.search(r"\b(?:no|without)\s+" + re.escape(g.lower()), query.lower())
    ]
    if exclude_genre:
        excluded.append(exclude_genre)
    results = []
    for m in movies:
        if m.id in positive or m.id in (fusion or []):
            continue
        if max_runtime and (not m.runtime or m.runtime > max_runtime):
            continue
        if any(g in m.genres for g in excluded):
            continue
        affinity = sum(weights.get(g, 0) for g in m.genres) / max(1, sum(weights.values()))
        semantic = (
            float(
                np.dot(
                    target,
                    m.embedding
                    if m.embedding is not None
                    else encode([m.title + " " + " ".join(m.genres)])[0],
                )
            )
            if target is not None
            else 0
        )
        mood_score = dna(m).get(mood, 0)
        quality = ((m.score * m.votes + 3.5 * 20) / (m.votes + 20)) / 5
        discovery = quality / (1 + np.log1p(m.votes))
        score = (
            0.25 * quality
            + 0.3 * affinity
            + 0.8 * semantic
            + 0.5 * mood_score
            + novelty * discovery
            + 0.15 * np.tanh(cf.get(m.id, 0))
        )
        if query.lower() in m.title.lower() and query:
            score += 1
        reasons = [f"{mood} mood match"] if mood_score else []
        if affinity:
            reasons.append("Reflects your taste DNA")
        if semantic > 0.08:
            reasons.append("Matches your description")
        if cf.get(m.id, 0) > 0:
            reasons.append("Collaborative signal")
        results.append((m, round(float(score), 4), reasons or ["Community-rated discovery"]))
    return sorted(results, key=lambda r: r[1], reverse=True)
