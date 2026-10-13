"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Fingerprint,
  Orbit,
  Play,
  Star,
  SlidersHorizontal,
  Compass,
  Search,
  User,
  Film,
  Menu,
} from "lucide-react";
import { CinematicEntrance } from "../components/cinematic-entrance";
import { Poster } from "../components/poster";
import { sound } from "../lib/sound";
import { WatchModal } from "../components/watch-modal";
import { MovieModal } from "../components/movie-modal";
import { ProfileModal } from "../components/profile-modal";
import { SerializedMovie } from "../lib/catalog-service";

const films: (SerializedMovie & { rating: string; genre: string })[] = [
  {
    id: 109487,
    tmdb_id: 157336,
    title: "Interstellar",
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: null,
    match: 99,
    rating: "8.7",
    genre: "Sci-Fi · Epic",
    year: 2014,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    runtime: 169,
    score: 4.3,
    votes: 42000,
    director: "Christopher Nolan",
    stars: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    imdbRating: "8.7",
    metascore: 74,
    contentRating: "PG-13",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    dna: { Emotion: 92, Complexity: 88, Action: 50, Romance: 30, Suspense: 80, Visuals: 98, "Mind-Bending": 96 },
    reasons: ["Epic scale space odyssey with profound emotional stakes"],
  },
  {
    id: 5971,
    tmdb_id: 129,
    title: "Spirited Away",
    poster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop: null,
    match: 98,
    rating: "8.6",
    genre: "Animation · Fantasy",
    year: 2001,
    genres: ["Animation", "Family", "Fantasy"],
    overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    runtime: 125,
    score: 4.3,
    votes: 38000,
    director: "Hayao Miyazaki",
    stars: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    imdbRating: "8.6",
    metascore: 96,
    contentRating: "PG",
    tagline: "The tunnel led Chihiro to a mysterious town...",
    dna: { Emotion: 95, Complexity: 80, Action: 35, Romance: 40, Suspense: 60, Visuals: 99, "Mind-Bending": 85 },
    reasons: ["Beloved Studio Ghibli mythic masterpiece"],
  },
  {
    id: 79132,
    tmdb_id: 27205,
    title: "Inception",
    poster: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop: null,
    match: 99,
    rating: "8.8",
    genre: "Action · Mind-bending",
    year: 2010,
    genres: ["Action", "Sci-Fi", "Adventure"],
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\".",
    runtime: 148,
    score: 4.4,
    votes: 49000,
    director: "Christopher Nolan",
    stars: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    imdbRating: "8.8",
    metascore: 74,
    contentRating: "PG-13",
    tagline: "Your mind is the scene of the crime.",
    dna: { Emotion: 86, Complexity: 98, Action: 82, Romance: 45, Suspense: 95, Visuals: 96, "Mind-Bending": 99 },
    reasons: ["Pinnacle of multi-layered dream architecture and thrill"],
  },
  {
    id: 109374,
    tmdb_id: 120467,
    title: "The Grand Budapest Hotel",
    poster: "/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
    backdrop: null,
    match: 96,
    rating: "8.1",
    genre: "Comedy · Aesthetic",
    year: 2014,
    genres: ["Comedy", "Drama"],
    overview: "The Grand Budapest Hotel tells of a legendary concierge at a famous European hotel between the wars and his friendship with a young employee who becomes his trusted protégé.",
    runtime: 100,
    score: 4.1,
    votes: 28000,
    director: "Wes Anderson",
    stars: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric"],
    imdbRating: "8.1",
    metascore: 88,
    contentRating: "R",
    tagline: "A lively tale of robbery, love, and fine hospitality.",
    dna: { Emotion: 82, Complexity: 75, Action: 40, Romance: 60, Suspense: 50, Visuals: 98, "Mind-Bending": 65 },
    reasons: ["Symmetrical pastel perfection and witty narrative charm"],
  },
  {
    id: 164909,
    tmdb_id: 313369,
    title: "La La Land",
    poster: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    backdrop: null,
    match: 97,
    rating: "8.0",
    genre: "Musical · Romance",
    year: 2016,
    genres: ["Comedy", "Drama", "Music", "Romance"],
    overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, are struggling to make ends meet in a city known for crushing hopes and breaking hearts. Set in modern day Los Angeles, this original musical explores everyday life and what is more important: a once-in-a-lifetime love or your dreams.",
    runtime: 128,
    score: 4.0,
    votes: 26000,
    director: "Damien Chazelle",
    stars: ["Ryan Gosling", "Emma Stone", "John Legend"],
    imdbRating: "8.0",
    metascore: 94,
    contentRating: "PG-13",
    tagline: "Here's to the fools who dream.",
    dna: { Emotion: 96, Complexity: 72, Action: 20, Romance: 98, Suspense: 35, Visuals: 94, "Mind-Bending": 55 },
    reasons: ["Sweeping emotional tribute to passion, music, and Los Angeles"],
  },
];

const MOODS = [
  {
    id: "adrenaline",
    label: "Adrenaline",
    icon: "⚡",
    aura: "radial-gradient(ellipse at 70% 30%, rgba(245, 158, 11, 0.28), rgba(239, 68, 68, 0.12), transparent 70%)",
    pillColor: "#f59e0b",
    sampleMatch: "Mad Max: Fury Road & Dune — 99.1% Taste Sync",
  },
  {
    id: "mindbending",
    label: "Mind-bending",
    icon: "◈",
    aura: "radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.32), rgba(6, 182, 212, 0.14), transparent 70%)",
    pillColor: "#a855f7",
    sampleMatch: "Inception & Arrival — 99.8% Taste Sync",
  },
  {
    id: "heartfelt",
    label: "Heartfelt",
    icon: "♡",
    aura: "radial-gradient(ellipse at 70% 30%, rgba(244, 63, 94, 0.28), rgba(251, 146, 60, 0.12), transparent 70%)",
    pillColor: "#fb7185",
    sampleMatch: "Past Lives & Before Sunrise — 98.9% Taste Sync",
  },
  {
    id: "dark",
    label: "Dark & Noir",
    icon: "☾",
    aura: "radial-gradient(ellipse at 70% 30%, rgba(59, 130, 246, 0.26), rgba(99, 102, 241, 0.15), transparent 70%)",
    pillColor: "#60a5fa",
    sampleMatch: "The Batman & Prisoners — 98.4% Taste Sync",
  },
  {
    id: "comfort",
    label: "Comfort & Warmth",
    icon: "☀",
    aura: "radial-gradient(ellipse at 70% 30%, rgba(206, 247, 160, 0.32), rgba(34, 197, 94, 0.14), transparent 70%)",
    pillColor: "#cef7a0",
    sampleMatch: "Spirited Away & Paddington 2 — 99.5% Taste Sync",
  },
  {
    id: "wonder",
    label: "Cosmic Wonder",
    icon: "✧",
    aura: "radial-gradient(ellipse at 70% 30%, rgba(20, 184, 166, 0.28), rgba(168, 85, 247, 0.12), transparent 70%)",
    pillColor: "#2dd4bf",
    sampleMatch: "Interstellar & Blade Runner 2049 — 99.6% Taste Sync",
  },
];

export default function Landing() {
  const [selectedMood, setSelectedMood] = useState(MOODS[4]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [watchMovie, setWatchMovie] = useState<SerializedMovie | null>(null);
  const [detailMovie, setDetailMovie] = useState<SerializedMovie | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleMoodSelect = (mood: (typeof MOODS)[0]) => {
    setSelectedMood(mood);
    sound.playClick(620, 0.04);
  };

  return (
    <CinematicEntrance>
      {/* Clean Minimal Landing Header */}
      <header className="intro-nav" style={{ justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", height: "70px" }}>
        <Link href="/" className="sidebar-brand" style={{ padding: 0, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }} onClick={() => sound.playClick(440)}>
          <span className="brand-icon">
            C<span className="brand-dot" style={{ color: "var(--gold, #f5c518)" }}>✳</span>
          </span>
          <span className="brand-full-name" style={{ fontSize: "16px" }}>
            CINEVERSE<span className="brand-ai-badge" style={{ color: "var(--gold, #f5c518)", borderColor: "rgba(245, 197, 24, 0.3)", background: "rgba(245, 197, 24, 0.12)" }}>AI</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Link
            href="/signin"
            className="landing-nav-btn"
            style={{ fontWeight: 600, padding: "8px 18px", borderRadius: "999px", color: "#cbd5e1", textDecoration: "none" }}
            onClick={() => sound.playClick(540)}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="landing-nav-btn highlight"
            style={{ fontWeight: 600, padding: "8px 20px", borderRadius: "999px", background: "linear-gradient(135deg, #f5c518 0%, #eab308 100%)", color: "#080c14", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", boxShadow: "0 0 16px rgba(245, 197, 24, 0.3)" }}
            onClick={() => sound.playClick(640)}
          >
            <span>Get Started</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      <main className="intro-main">
        <section className="intro-hero">
          {/* Ambient cursor flashlight follower */}
          <div className="hero-ambient-cursor" />

          {/* Film Grain & Dynamic Ambient Aura */}
          <div className="intro-grain" />
          <motion.div
            className="intro-glow"
            animate={{ background: selectedMood.aura }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Hero Left Copy */}
          <div className="intro-copy">
            <div className="eyebrow">
              <span className="live-dot" /> THE NEXT CHAPTER OF MOVIE DISCOVERY
            </div>

            <h1>
              Life’s too short
              <br />
              for <em>just okay</em>
              <br />
              movies<span style={{ color: "var(--gold, #f5c518)" }}>.</span>
            </h1>

            <p>
              A universe of stories. A feeling only you know.
              <br />
              Tuned to your wavelength through neural taste modeling.
            </p>

            {/* Clean Cinema Hero Actions */}
            <div className="intro-actions" style={{ gap: "14px" }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="intro-cta"
                  onClick={() => sound.playClick(720)}
                >
                  <span>Enter CineVerse</span>
                  <ArrowUpRight size={18} />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signin"
                  className="intro-secondary"
                  onClick={() => sound.playClick(560)}
                >
                  <Sparkles size={14} style={{ color: "var(--gold, #f5c518)" }} />
                  <span>Sign in</span>
                </Link>
              </motion.div>
            </div>

            <div className="intro-note">
              <span>✦</span> Follow your mood. Discover your taste. 9,700+ cinema masterworks.
            </div>
          </div>

          {/* Film Universe: 3D interactive tilting cards & continuous rotating rings */}
          <div
            className="film-universe"
            aria-label="A universe of movie posters"
          >
            <div className="universe-ring ring-one" />
            <div className="universe-ring ring-two" />

            {films.map((item, i) => (
              <motion.div
                key={item.title}
                className={`orbit-film film-${i}`}
                onMouseEnter={() => {
                  setHoveredCard(i);
                  sound.playClick(440 + i * 50, 0.02);
                }}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{ scale: 1.08, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                <div
                  className="orbit-film-link"
                  aria-label={`Explore ${item.title}`}
                  onClick={() => {
                    sound.playClick(700);
                    setDetailMovie(item);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Poster path={item.poster} title={item.title} priority={i < 3} />

                  <div className="card-gloss-sheen" />

                  <div className="film-hover-badge">
                    <div className="badge-title">{item.title}</div>
                    <div className="badge-meta">
                      <span className="badge-rating">
                        <Star size={11} fill="currentColor" /> {item.rating}
                      </span>
                      <span>{item.year}</span>
                    </div>
                  </div>

                  {/* Direct Watch Trailer Overlay Button */}
                  <button
                    type="button"
                    className="card-quick-watch-btn landing-card-watch-btn"
                    title={`Watch Trailer for ${item.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playChime();
                      setWatchMovie(item);
                    }}
                  >
                    <Play size={11} fill="currentColor" /> Watch Trailer
                  </button>
                </div>
              </motion.div>
            ))}

            <Link
              href="/signin"
              className="floating-label label-one"
              onClick={() => sound.playClick(600)}
            >
              <Sparkles size={16} />
              <div>
                YOUR NEXT FAVORITE
                <small>Somewhere in this universe · Tap to begin</small>
              </div>
            </Link>

            <Link
              href="/signin"
              className="floating-label label-two"
              onClick={() => sound.playClick(600)}
            >
              <span>✳</span> Made for your kind of cinema
            </Link>

            <span className="universe-coordinate">
              35° 41′ N &nbsp; / &nbsp; ENDLESS POSSIBILITIES
            </span>
          </div>
        </section>

        {/* Live Ticker Ribbon */}
        <section className="cinematic-ticker">
          <div className="ticker-track">
            <span>✦ 35,420 FILMS CATALOGED</span>
            <span className="ticker-dot">·</span>
            <span>✳ 99.4% NEURAL TASTE ACCURACY</span>
            <span className="ticker-dot">·</span>
            <span>🍿 100% CURATED FOR HUMANS</span>
            <span className="ticker-dot">·</span>
            <span>⚡ ZERO GENERIC ALGORITHM TRAPS</span>
            <span className="ticker-dot">·</span>
            <span>✦ 35,420 FILMS CATALOGED</span>
            <span className="ticker-dot">·</span>
            <span>✳ 99.4% NEURAL TASTE ACCURACY</span>
          </div>
        </section>

        {/* Interactive Experience Grid */}
        <section className="intro-features-section">
          <div className="section-header">
            <span className="eyebrow">THE REVOLUTION IN STREAMING</span>
            <h2>Stop endless scrolling.<br /><em>Start truly watching.</em></h2>
          </div>

          <div className="features-glass-grid">
            <Link
              href="/signin"
              className="feature-glass-card"
              onClick={() => sound.playClick(580)}
            >
              <div className="feature-icon-box">
                <Fingerprint size={24} />
              </div>
              <h3>Taste DNA Mapping</h3>
              <p>
                Our multi-dimensional vector embeddings capture the nuanced themes, emotional arcs, and aesthetic cinematography you actually adore.
              </p>
              <div className="feature-card-arrow">
                <span>Sign in to map DNA</span>
                <ArrowUpRight size={16} />
              </div>
            </Link>

            <Link
              href="/signin"
              className="feature-glass-card"
              onClick={() => sound.playClick(600)}
            >
              <div className="feature-icon-box">
                <Compass size={24} />
              </div>
              <h3>Dynamic Mood Sync</h3>
              <p>
                Tired of genre boxes? Search by how you want to feel — from adrenaline-pumping thrillers to melancholic rainy-day comforts.
              </p>
              <div className="feature-card-arrow">
                <span>Sign in to Sync</span>
                <ArrowUpRight size={16} />
              </div>
            </Link>

            <Link
              href="/signin"
              className="feature-glass-card"
              onClick={() => sound.playClick(620)}
            >
              <div className="feature-icon-box">
                <Orbit size={24} />
              </div>
              <h3>Endless Cinematic Worlds</h3>
              <p>
                Navigate 19 distinct cinematic universes spanning Japanese animation, psychological noir, indie darlings, and space epics.
              </p>
              <div className="feature-card-arrow">
                <span>Browse Universes</span>
                <ArrowUpRight size={16} />
              </div>
            </Link>
          </div>
        </section>

        {/* Compact Discovery Section */}
        <section className="compact-discovery" aria-label="Ways to discover">
          <div>
            <span className="eyebrow">YOUR NIGHT. YOUR WAY.</span>
            <p>A mood, a genre, or a little serendipity.</p>
          </div>
          <Link
            href="/signin"
            onClick={() => sound.playClick(640)}
          >
            <Sparkles size={18} /> Find my feeling <ArrowUpRight size={15} />
          </Link>
          <Link
            href="/signin"
            onClick={() => sound.playClick(660)}
          >
            <Orbit size={18} /> Explore 19 worlds <ArrowUpRight size={15} />
          </Link>
          <Link
            href="/signin"
            className="discovery-preview-btn"
            onClick={() => sound.playClick(680)}
          >
            <Fingerprint size={18} /> Sign In to Vault <ArrowUpRight size={15} />
          </Link>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="intro-footer">
        <Link href="/" className="sidebar-brand" style={{ padding: 0, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }} onClick={() => sound.playClick(440)}>
          <span className="brand-icon">
            C<span className="brand-dot" style={{ color: "var(--gold, #f5c518)" }}>✳</span>
          </span>
          <span className="brand-full-name" style={{ fontSize: "16px" }}>
            CINEVERSE<span className="brand-ai-badge" style={{ color: "var(--gold, #f5c518)", borderColor: "rgba(245, 197, 24, 0.3)", background: "rgba(245, 197, 24, 0.12)" }}>AI</span>
          </span>
        </Link>
        <p>Made for the love of the story.</p>
        <div>
          <Link href="/signin" onClick={() => sound.playClick(500)}>Discover</Link>
          <Link href="/signin" onClick={() => sound.playClick(520)}>Taste Lab</Link>
          <Link href="/signin" onClick={() => sound.playClick(540)}>Universes</Link>
          <Link href="/signin" onClick={() => sound.playClick(560)}>Profile</Link>
          <Link href="/signin" onClick={() => sound.playClick(580)}>Sign In</Link>
          <Link href="/signin" onClick={() => sound.playClick(600)}>Sign Up</Link>
        </div>
        <small>
          MovieLens community ratings · Movie metadata and artwork from TMDB.
          <br />
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </small>
      </footer>

      {/* 🎬 IMDb-GRADE RICH MOVIE MODAL (CAST, RATINGS, TRIVIA, DNA, WATCH) */}
      <MovieModal
        movie={detailMovie}
        isOpen={Boolean(detailMovie)}
        onClose={() => setDetailMovie(null)}
        onWatch={(movie) => {
          setDetailMovie(null);
          setWatchMovie(movie);
        }}
      />

      {/* 🎬 WATCH NOW STREAMING & SERVER HUB MODAL */}
      <WatchModal
        movie={watchMovie}
        isOpen={Boolean(watchMovie)}
        onClose={() => setWatchMovie(null)}
        onOpenDetails={(movie) => {
          setWatchMovie(null);
          setDetailMovie(movie);
        }}
      />

      {/* 👤 SHOW PROFILE QUICK MODAL */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profileName="Cinephile Guest"
        watchedCount={54}
        watchlistCount={22}
        ratingsCount={41}
      />
    </CinematicEntrance>
  );
}
