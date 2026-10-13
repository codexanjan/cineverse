# Movie metadata and artwork

The movie identities and ratings originate from GroupLens MovieLens latest-small. Its license is included in MOVIELENS-LICENSE.txt.

Plots, runtimes and poster paths are joined by TMDB IDs from:

- https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies — TMDB_movie_dataset_v11.csv, snapshot September 22, 2026. Source SHA-256 and coverage are recorded in metadata-report.json.
- https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset — movies_metadata.csv, July 2017 snapshot, used for records absent from the newer snapshot.
- Public TMDB film metadata for a bounded set of missing artwork paths.

Poster images are requested directly from TMDB's sized CDN and are not bundled. Artwork belongs to its respective rights holders. Review MovieLens and TMDB terms before commercial redistribution. The application includes TMDB attribution and supports token-authenticated live API hydration when configured.

This product uses the TMDB API but is not endorsed or certified by TMDB.
