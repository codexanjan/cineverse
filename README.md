<div align="center">

<img src="assets/hero-banner.jpg" alt="Cineverse AI — The Intelligent Cinematic Universe" width="100%" />

# 🎬 CINEVERSE AI
### The Intelligent Cinematic Universe & AI Recommendation Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![MovieLens](https://img.shields.io/badge/Trained_On-MovieLens_32M-FF6F00?style=for-the-badge&logo=kaggle&logoColor=white)](https://grouplens.org/datasets/movielens/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Tired of endless streaming fatigue and algorithmic echo chambers?</b><br>
  Cineverse blends <b>Latent Semantic NLP</b>, <b>Hybrid Collaborative Matrix Factorization</b>, and <b>Cinematic Motion Design</b> into a breathtaking discovery engine.
</p>

[✨ Explore Features](#-key-features) • [🚀 Quickstart](#-quickstart) • [🧠 ML Architecture](#-neural--hybrid-recommendation-engine) • [🐳 Docker Setup](#-docker--production-deployment) • [📡 API Reference](#-api-endpoints)

---

</div>

## 🌟 Why Cineverse?

Mainstream streaming platforms have a problem: **their algorithms optimize for ad clicks and studio contracts, not your genuine taste.** 

**Cineverse AI** changes the paradigm:
- 🎯 **Algorithmic Agency**: Fine-tune your recommendations with real-time mood sliders, genre DNA weightings, and novelty controls.
- ⚡ **Zero-Tracking Local Sandbox**: Run the entire stack locally with 100% offline data—no mandatory API keys, tracking cookies, or subscriptions.
- 👥 **Group Night Solver**: Solves the "what should we watch?" argument for 2–8 people using minimax consensus ranking.
- 💎 **Hidden Gems Radar**: Surfaces critically acclaimed masterpieces that the mainstream algorithms bury.

---

## 📸 Visual Showcase

<div align="center">
  <img src="assets/discovery-showcase.jpg" alt="Cineverse AI Movie Discovery Interface" width="100%" />
  <p><i>Neural Taste DNA radar chart, real-time mood spectrum sliders, and natural language movie search.</i></p>
</div>

<br>

<div align="center">
  <img src="assets/theater-showcase.jpg" alt="Cineverse 4K Trailer Theater & Cast Orbit" width="100%" />
  <p><i>4K HDR trailer cinema theater, interactive cast & crew rolodex, and fluid glassmorphism controls.</i></p>
</div>

---

## ✨ Key Features

### 🌌 1. Ultra-Modern Cinematic Interface
- **GSAP Choreographed Entrances**: Silky-smooth sequence animations upon arrival.
- **Glassmorphic Navigation Bar**: Responsive backdrop blur with integrated search and quick portals.
- **Interactive 3D Rolodex Ring**: Dynamic rotating movie carousel with smooth perspective shifts.
- **Expanding Universe Rails**: Fluid genre dimension cards that expand on hover with particle aura effects.
- **Framer Motion Micro-Interactions**: Physics-based modals, smooth transitions, and tactile hover feedback.

### 🧬 2. Hybrid Neural & Semantic Discovery
- **Natural Language Query Engine**: Search by abstract themes like *"mind-bending sci-fi thrillers with existential dread"* or *"cozy rainy autumn mysteries"*.
- **6 Mood Spectrum Sliders**: Dynamically bias recommendations along *Mind-Bending*, *Melancholic*, *Adrenaline*, *Uplifting*, *Heartwarming*, and *Visceral*.
- **Personal Taste DNA**: Live radar visualization mapping your categorical affinities across 19 genres.
- **Taste Lab Fusion**: Select any 2 or 3 movies and compute their algorithmic hybrid lovechild.

### 🍿 3. Instant 4K Trailer Theater & Cast Explorer
- **Zero-Friction Trailers**: Instant YouTube trailer lookup and seamless modal theater player.
- **Cast & Crew Orbit**: Interactive filmography exploration with actor avatars and cross-movie credits.
- **Deep Film Specs**: Real-time MovieLens community ratings, release decades, runtimes, and TMDB plot summaries.

### 👥 4. Group Night Consensus Solver
- Pick 2 to 8 group members.
- Input each person's favorite films or preferences.
- Cineverse executes a **minimax fairness optimization** that maximizes collective happiness while minimizing individual disappointment.

### 💎 5. Hidden Gems & Mystery Reveal
- **Hidden Gems Scanner**: Filters for high rating-to-vote ratios to discover indie and world cinema jewels.
- **Mystery Pick**: Interactive blind-pick game with a cinematic reveal animation for indecisive movie nights.
- **Watch Journal**: Complete personal history, bookmarks, watchlist, and "Not for me" dismissals.

---

## 🧠 Neural & Hybrid Recommendation Engine

Cineverse combines collaborative filtering, latent semantic indexing, and content-based heuristics into an ensemble scoring pipeline:

```mermaid
graph TD
    UserQuery["User Natural Query / Mood"] --> SemanticEncoder["Latent Semantic Plot Encoder (LSA / TF-IDF / SVD)"]
    UserHistory["User Taste Profile / Ratings"] --> CollabModel["MovieLens Matrix Factorization (Latent Factors)"]
    Catalog["MovieLens 32M + TMDB Catalog (9,742+ Films)"] --> FeatureStore["Vector Features & Metadata"]
    
    SemanticEncoder --> Ensemble["Hybrid Ranker Engine"]
    CollabModel --> Ensemble
    FeatureStore --> Ensemble
    
    Filters["Hard Filters (Decade, Genre, Runtime, Exclusions)"] --> Ensemble
    Ensemble --> FinalRank["Ranked Cinematic Recommendations + Match Explanations"]
```

$$\text{FinalScore}(m) = w_s \cdot \text{Sim}_{\text{Semantic}}(q, m) + w_c \cdot \hat{r}_{u,m} + w_g \cdot \text{TasteOverlap}(u, m) + w_n \cdot \text{Novelty}(m)$$

- **Matrix Factorization**: Trained on MovieLens (100k+ ratings in demo mode, scalable to MovieLens 32M).
- **Semantic Latent Space**: 9,687+ enriched movie plots projected into compact vector space (`data/semantic.npz` and `data/vocabulary.json`).
- **Explainability**: Every recommendation includes transparent rationale (e.g., *"Matches your Sci-Fi preference"*, *"Because you liked Inception"*, *"High community consensus"*).

---

## 🚀 Quickstart

### Option A: Standard Local Run (Zero External Setup Required)

**Prerequisites**: Node.js 22+, Python 3.12+

#### 1. Start the FastAPI Engine
```bash
# Clone the repository
git clone https://github.com/codexanjan/cineverse.git
cd cineverse

# Create virtual environment
python -m venv .venv

# Activate environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows PowerShell:
.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r apps/api/requirements.txt

# Run migrations and start API
cd apps/api
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start the Cinematic Next.js Web App
In a second terminal window from the repository root:
```bash
# Install frontend packages
npm install

# Start development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser!  
Interactive API Swagger Docs are available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

### Option B: Docker Compose (One Command)

```bash
# Copy sample configuration (clean defaults included)
cp .env.example .env

# Launch Next.js, FastAPI, PostgreSQL (pgvector), Redis & background worker
docker compose up --build -d
```

- Web Interface: `http://localhost:3000`
- API & Docs: `http://localhost:8000/docs`
- Background Worker: Auto-syncs and manages hydration queues.

---

## 📁 Repository Structure

```
cineverse/
├── apps/
│   ├── web/                    # Next.js 16 (App Router, Turbopack, Framer Motion, GSAP)
│   │   ├── app/                # Pages: Discover, Categories, About, Profile, Auth
│   │   ├── components/         # Cinematic UI: Modals, Rolodex, Rails, Navbar
│   │   ├── lib/                # Catalog, Stream, Cast, and Sound APIs
│   │   └── data/               # Actors, Trailers, and Local Catalog Cache
│   └── api/                    # FastAPI Backend Recommender Service
│       ├── app/                # Main router, Recommender, Catalog, Auth, DB
│       ├── migrations/         # Alembic DB migrations
│       └── tests/              # Flow tests and benchmark suite
├── assets/                     # 4K UI mockups, Hero banner, and showcase media
├── data/                       # MovieLens dataset, pre-trained model weights (.npz)
│   ├── catalog.json            # 9,742 movies with TMDB metadata
│   ├── model.npz               # Trained collaborative latent factors
│   ├── semantic.npz            # Trained semantic plot embeddings
│   └── vocabulary.json         # Vocabulary dictionary for plot indexing
├── ml/                         # Training pipelines (MovieLens 32M, SVD, Semantic)
├── compose.yaml                # Multi-service Docker Compose configuration
└── package.json                # Workspace monorepo root
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/health` | Service health status and catalog item counts |
| `GET` | `/movies` | Paginated movie catalog with filtering & sorting |
| `GET` | `/movies/{id}` | Detailed movie record with plot, artwork & metrics |
| `POST` | `/discover` | Natural language semantic discovery & mood ranking |
| `POST` | `/group` | Group night consensus recommendation solver |
| `GET` | `/categories` | 19 catalog genres with film counts and cover art |
| `GET` | `/me/profile` | Current user profile, taste DNA, and preferences |
| `POST` | `/me/profile` | Update user preferences, avatars, and genre weights |
| `POST` | `/me/movies/{id}` | Update watched, favorites, and watchlist status |
| `GET` | `/api/trailer` | Real-time trailer resolution |
| `GET` | `/api/cast/photo` | Cast & crew metadata with high-res headshots |

---

## 🛠️ Tech Stack & Credits

- **Frontend**: [Next.js 16](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/), [Framer Motion](https://motion.dev/), [Lucide Icons](https://lucide.dev/)
- **Backend & ML**: [FastAPI](https://fastapi.tiangolo.com/), [NumPy](https://numpy.org/), [SciPy](https://scipy.org/), [Scikit-learn](https://scikit-learn.org/), [SQLAlchemy](https://www.sqlalchemy.org/), [Alembic](https://alembic.sqlalchemy.org/)
- **Storage & Infrastructure**: [PostgreSQL 16](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector), [Redis 7](https://redis.io/), [Docker](https://www.docker.com/), [Caddy](https://caddyserver.com/)
- **Datasets**: [GroupLens MovieLens](https://grouplens.org/datasets/movielens/), [The Movie Database (TMDB)](https://www.themoviedb.org/)

---

## 🤝 Contributing

Contributions are what make the open-source community an incredible place to learn, inspire, and create!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.  
MovieLens data is subject to the [GroupLens License Terms](data/MOVIELENS-LICENSE.txt).

---

<div align="center">
  <sub>Built with ❤️ for cinephiles and developers worldwide. If you find Cineverse inspiring, don't forget to give it a ⭐!</sub>
</div>
