# Verification record

Verified on Windows, 23 September 2026.

| Check | Result |
|---|---|
| Next.js optimized production build and TypeScript | Passed |
| Standalone production server | Started and tested at localhost:3000 |
| Python Ruff checks | Passed |
| API regression suite | 15 passed; group regression rechecked after adding host dismissal exclusions |
| Playwright production browser suite | 8 passed, 48.9 seconds |
| SQLite migrations | Upgrade to 0004, downgrade to base, upgrade to 0004 passed on an isolated database; existing app database upgraded to 0004 |
| Alembic schema drift | No new upgrade operations detected |
| PostgreSQL vector query contract | SQL compilation and NumPy-vector ranking regression passed |
| Desktop visual inspection | Landing, login, categories and discovery checked; 9 landing images, 4 login images, 19 category covers and 24 first-page discovery posters loaded without fallbacks |
| Mobile viewport | 390 × 844, landing/login/categories/discovery fit without horizontal overflow; pagination passed |
| Browser JavaScript errors | None in checked flow |
| Animation and new profile | GSAP entrance and Framer Motion interactions built; compact landing and profile passed mobile/reduced-motion checks |
| npm dependency audit during install | No reported vulnerabilities |

The API tests cover catalog pagination/validation, account isolation, partial updates, concurrent first-time saves, discovery modes, hard runtime/genre exclusions, fusion exclusions, group balancing, malformed/forged authentication, production demo rejection, verified identity and admin allowlisting, live catalog fallback, idempotent TMDB import, and PostgreSQL vector expression compatibility. Supabase/TMDB network responses in integration tests are mocked.

The browser tests cover ratings and watchlist persistence across reload, taste DNA, mystery conceal/reveal, group selection by title, fusion, semantic search, live-catalog fallback and mobile layout. Two race conditions discovered during testing were fixed: simultaneous feedback inserts now use atomic upserts, and stale discovery responses can no longer overwrite a newer mode. Artwork uses the provider's sized CDN URLs directly so stalled image optimization cannot occupy the app's request connections.

The added API tests cover category counts, combined filters and sorting, mood recommendations with hard filters, local account creation, salted password storage, HttpOnly session cookies, duplicate signup, invalid credentials, logout, login persistence, watch journals, cross-origin mutation rejection and local-auth production disablement. The new browser journey follows the landing page to categories, applies a runtime filter, creates an account, marks a movie watched, signs out, signs in again, verifies the saved journal entry, and retrieves similar movies. New routes were checked on mobile. Artwork recovery uses a separate concurrency limit after verification exposed network recovery requests delaying catalog navigation.

The refreshed catalog contains 9,693 poster paths, 9,687 plot descriptions and 9,693 runtimes across 9,742 films. This records metadata coverage; every remote URL in the catalog was not individually checked. The first-page and new-page images listed above were checked in a real browser.

Profile verification covers validation, identity isolation, preferred-genre ranking reasons, watched-film exclusion and re-enabling, dismissed-film exclusion, export contents and cache controls, password changes, old-password rejection and other-session revocation. Browser checks cover profile/avatar/genre persistence after reload, export download, dismissal/restoration, collection search, password change followed by sign-out and login, and readable mobile pages with reduced motion. A temporary proxy reset discovered during the run is now handled by bounded retries for reads; mutations are not automatically replayed. A simulated 503-to-success browser test verifies recovery. Collection loading now fetches movie records in a batch rather than issuing one query per saved film.

## Trained artifacts

- Collaborative model: biased matrix factorization trained on **100,836** MovieLens latest-small ratings, **610** users and **9,742** films.
- Validation: **9,984** held-out observations, **0.8521 RMSE**, versus **1.0463** for the mean-rating baseline. The validation split also selects the best epoch; this is not an untouched final test set.
- Semantic model: TF-IDF plus truncated SVD retrained on **9,742** enriched catalog documents, **96** latent dimensions padded to the 384-dimensional storage contract; explained variance 0.15545. All stored embeddings were refreshed and the API restarted.
- Full MovieLens 32M download, ingestion and training scripts are included. The full 32M run was not executed.

## Not verified in this environment

- Docker and the actual PostgreSQL/pgvector/Redis stack: Docker was unavailable. CI includes PostgreSQL migration cycles and API tests, Redis services, a frontend build and browser tests, but that hosted workflow has not been run here.
- Real Supabase password/confirmation-email login: no Supabase credentials were supplied. The client and server integration is implemented; no email was sent. Installation-local signup/login/logout were exercised end to end.
- Authenticated TMDB API hydration/current-catalog search: no token was supplied. A public September 22, 2026 metadata snapshot was joined to the MovieLens catalog instead; provenance and checksum are recorded in `data/metadata-report.json`. Movies absent from the snapshot may still have older metadata or a local image fallback.
- Optional neural encoder and feature-flagged CSS 3D galaxy were not exercised in the final production browser suite.
- No cloud deployment, load test, recommendation A/B test or independent security audit was performed.

One deprecation warning originates from the installed Starlette/AnyIO test-client combination. It does not fail the tests.
