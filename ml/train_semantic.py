"""Train a lightweight, offline latent semantic model on the catalog metadata."""

import argparse
import json
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD

p = argparse.ArgumentParser()
p.add_argument("--data", type=Path, default=Path("data"))
a = p.parse_args()
rows = json.loads((a.data / "catalog.json").read_text(encoding="utf-8"))
texts = [m["title"] + " " + (" ".join(m["genres"]) + " ") * 3 + m.get("overview", "") for m in rows]
v = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), sublinear_tf=True)
x = v.fit_transform(texts)
svd = TruncatedSVD(n_components=min(96, x.shape[0] - 1, x.shape[1] - 1), random_state=42)
svd.fit(x)
np.savez_compressed(
    a.data / "semantic.npz",
    idf=v.idf_.astype(np.float32),
    components=svd.components_.astype(np.float32),
)
(a.data / "vocabulary.json").write_text(json.dumps({k: int(n) for k, n in v.vocabulary_.items()}))
print(
    {
        "documents": len(texts),
        "dimensions": len(svd.components_),
        "explained_variance": float(svd.explained_variance_ratio_.sum()),
    }
)
