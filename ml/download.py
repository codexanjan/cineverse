import argparse
import urllib.request
import zipfile
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("--dataset", choices=["small", "32m"], default="small")
p.add_argument("--destination", type=Path, default=Path("data/raw"))
a = p.parse_args()
a.destination.mkdir(parents=True, exist_ok=True)
name = "ml-32m" if a.dataset == "32m" else "ml-latest-small"
target = a.destination / (name + ".zip")
url = "https://files.grouplens.org/datasets/movielens/" + name + ".zip"
print("Downloading", url)
urllib.request.urlretrieve(url, target)
with zipfile.ZipFile(target) as z:
    for info in z.infolist():
        dest = (a.destination / info.filename).resolve()
        if not dest.is_relative_to(a.destination.resolve()):
            raise ValueError("Unsafe archive member")
    z.extractall(a.destination)
print("Read dataset README/license before commercial use:", a.destination / name)
