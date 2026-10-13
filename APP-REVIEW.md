# CINEVERSE feature and readiness review

Reviewed September 23, 2026. The local application is runnable and the checked flows pass. This is a feature and functional review, not a claim that every external service, remote image or production workload has been verified.

## Changes made from the review

| Area | Gap found | Implemented behavior |
|---|---|---|
| Landing | Too much repeated promotional content | One cinematic hero, three shortcuts, compact footer; explanation moved to `/about` |
| Motion | Static entry and abrupt interactions | GSAP entrance sequence with cleanup; Framer Motion cards, dialogs and profile feedback; reduced-motion support |
| Identity | No profile editor | Persistent display name, bio and six avatar choices, isolated by verified user identity |
| Cold start | No direct taste preferences | Up to ten preferred genres provide a small, explained recommendation boost |
| Watched films | No preference for excluding them | Watched films excluded by default; profile toggle allows them again, except other rating/favorite exclusions |
| Negative feedback | No explicit dismissal | “Not for me” excludes a film from individual recommendations and the host's group results; reversible from its collection |
| Library | No way to find a saved title quickly | Collection search and title/year/rating sorting |
| Account | No password-change page | Verify current password, set a new password, revoke other local sessions; Supabase integration when configured |
| Portability | No user export | Download profile, preferences, ratings and collections as JSON, without password hashes or session tokens |
| Reliability | A transient proxy reset could leave discovery empty | Bounded retries for read requests; no automatic replay of writes; error/retry states retained |
| Database access | One query per saved movie | Batch-fetch collection movies without their embeddings |

## Current capabilities

| Level | Capability | State |
|---|---|---|
| Basic | Landing, login/signup, profile editing, password changes | Working locally; browser verified |
| Basic | Catalog, 19 categories, genre/era/runtime/rating filters, sorting | Working; API and browser verified |
| Basic | Watchlist, favorites, ratings, watch journal | Persistent; isolation and reload checks passed |
| Intermediate | Mood discovery, semantic search, hidden gems, mystery and single picks | Implemented; checked in API/browser suites |
| Intermediate | Similar movies, fusion, novelty control, taste DNA | Implemented; fusion and related-film flows checked |
| Intermediate | Preferred genres, exclusions, data export, searchable collections | Added and checked |
| Advanced | Hybrid collaborative/content/semantic ranking | Real trained artifacts; latest-small CF model and enriched-catalog latent semantic model |
| Advanced | Group compromise recommendations | Implemented using the least-satisfied participant's score; checked |
| Advanced | PostgreSQL vector retrieval, Redis cache and workers | Implemented with Docker/CI configuration; actual stack unavailable on this workstation |
| Advanced | Supabase auth, TMDB live search/hydration, admin queue | Integrations implemented; real credentials absent, so external success paths remain unverified |
| Experimental | Feature-flagged CSS 3D galaxy | Present; not a WebGL renderer or a production-validated 3D experience |

## Still absent or requiring a separate production step

These were not replaced with pretend results or disconnected buttons:

- **Account recovery and verified email in local mode:** use configured Supabase auth for managed accounts; a dedicated recovery-email flow still needs implementation and delivery testing. Changing a known password works now.
- **Movie detail depth:** trailers, cast/crew browsing, region-specific streaming availability and provider deep links are not implemented.
- **Social features:** no persistent invitation rooms, shared collections, synchronized voting, activity feed or real-time watch parties. Group Night currently combines favorite films in one browser session.
- **Discovery evaluation:** full MovieLens 32M training scripts exist, but that full training run has not been executed. No untouched final ranking benchmark, online A/B test or recommendation-lift measurement has been performed.
- **Neural/scale upgrades:** optional neural embeddings are available but unverified here; multi-million-item latency, distributed caches, job retries under load and horizontal scaling require profiling and production infrastructure tests.
- **Deployment operations:** provision auth/catalog credentials, run PostgreSQL/Redis/Docker checks, configure TLS/backups/monitoring and test restore procedures before public production use. No cloud deployment was performed.
- **Content accuracy:** snapshots can be stale and some metadata remains missing. Poster URLs require internet and may change. This application recommends movies and does not license or stream them.

## How recommendations work

1. Catalog browsing uses actual movie records and hard filters. It remains separate from personalized exclusions so any film can still be found.
2. Personalized discovery combines Bayesian-adjusted community quality, genre affinity, semantic similarity, mood scores, collaborative item factors and novelty. Preferred genres add a small boost.
3. Runtime, era, genre, minimum score, dismissals and watched preferences constrain results. Rated/favorited films and fusion anchors are excluded by the ranking engine's existing discovery policy.
4. Ratings and favorites update taste DNA and collaborative signals. There is no claim of automatic full-model retraining after every click.
5. Group Night scores each participant separately and ranks common candidates using the lowest participant score. Reasons describe contributing signals; they are not causal explanations or guarantees that someone will enjoy a film.

See `VERIFICATION.md` for the executed checks and environment limitations.
