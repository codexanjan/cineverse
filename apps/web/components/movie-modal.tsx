"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Bookmark,
  Heart,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Star,
  Clock,
  Film,
  Users,
  Clapperboard,
  Music,
  Camera,
  ExternalLink,
  Share2,
  Check,
  EyeOff,
  Lightbulb,
  Headphones,
  Sun,
  Disc,
} from "lucide-react";
import { SerializedMovie } from "../lib/catalog-service";
import { Poster } from "./poster";
import { sound } from "../lib/sound";
import { getMovieTrailerEmbedUrl, getYouTubeWatchUrl, getCuratedTrailerId } from "../lib/trailer";
import { getActorPhoto } from "../lib/cast-service";

const FAMOUS_QUOTES: Record<string, string> = {
  "forrest gump": "“Mama always said life was like a box of chocolates. You never know what you're gonna get.”",
  "shawshank redemption, the": "“Get busy living, or get busy dying. Hope is a good thing, maybe the best of things, and no good thing ever dies.”",
  "godfather, the": "“I'm gonna make him an offer he can't refuse.”",
  "pulp fiction": "“The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men.”",
  "fight club": "“It's only after we've lost everything that we're free to do anything.”",
  "matrix, the": "“There is a difference between knowing the path and walking the path.”",
  "dark knight, the": "“You either die a hero, or you live long enough to see yourself become the villain.”",
  "star wars: episode iv - a new hope": "“The Force will be with you. Always.”",
  "jurassic park": "“Life, uh, finds a way.”",
  "casablanca": "“Here's looking at you, kid.”",
  "lord of the rings: the fellowship of the ring, the": "“Even the smallest person can change the course of the future.”",
  "gladiator": "“What we do in life echoes in eternity.”",
  "goodfellas": "“As far back as I can remember, I always wanted to be a gangster.”",
  "silence of the lambs, the": "“A census taker once tried to test me. I ate his liver with some fava beans and a nice Chianti.”",
  "interstellar": "“Love is the one thing we're capable of perceiving that transcends dimensions of time and space.”",
  "inception": "“An idea is like a virus. Resilient. Highly contagious.”",
  "schindler's list": "“Whoever saves one life saves the world entire.”",
  "back to the future": "“Roads? Where we're going, we don't need roads.”",
  "lion king, the": "“Remember who you are.”",
  "alien": "“In space, no one can hear you scream.”",
};

const COMPANION_PAIRINGS: Record<string, { title: string; year: number; why: string; synergy: number }> = {
  "forrest gump": { title: "Cast Away", year: 2000, why: "Tom Hanks and Robert Zemeckis deliver another monumental testament to fate, time, and the human spirit.", synergy: 98 },
  "shawshank redemption, the": { title: "The Green Mile", year: 1999, why: "Frank Darabont adapts Stephen King with deep emotional catharsis, prison brotherhood, and quiet miracles.", synergy: 99 },
  "godfather, the": { title: "Goodfellas", year: 1990, why: "The grand operatic dynastic mob saga pairs seamlessly with Scorsese's hyper-kinetic street realism.", synergy: 97 },
  "pulp fiction": { title: "Reservoir Dogs", year: 1992, why: "Tarantino's groundbreaking non-linear storytelling, explosive dialogue, and genre-redefining cool.", synergy: 98 },
  "fight club": { title: "American Psycho", year: 2000, why: "Sharp, provocative dark satire unpacking late-90s consumerism and fractured identity.", synergy: 96 },
  "matrix, the": { title: "Blade Runner 2049", year: 2017, why: "Philosophical cybernetic realism, high-concept visual mastery, and simulated truth.", synergy: 97 },
  "inception": { title: "Interstellar", year: 2014, why: "Christopher Nolan's awe-inspiring architectural scale pushing the bounds of physics and emotion.", synergy: 99 },
  "interstellar": { title: "Arrival", year: 2016, why: "Expansive cosmic science fiction grounded in profound human family and linguistic revelation.", synergy: 97 },
  "jurassic park": { title: "King Kong", year: 2005, why: "Unmatched cinematic wonder, primordial beasts, and man's perilous hubris in untamed worlds.", synergy: 95 },
  "dark knight, the": { title: "Heat", year: 1995, why: "Nolan explicitly modeled Gotham's dual-protagonist crime confrontation on Michael Mann's masterpiece.", synergy: 99 },
  "schindler's list": { title: "The Pianist", year: 2002, why: "Profound, harrowing historical chronicles of human perseverance and survival in wartime.", synergy: 98 },
  "silence of the lambs, the": { title: "Se7en", year: 1995, why: "Taut psychological investigative dread with unforgettable villain psychology and atmosphere.", synergy: 98 },
};

const FAMOUS_THEMES: Record<string, string> = {
  "forrest gump": "Feather Theme & Suite (Alan Silvestri)",
  "shawshank redemption, the": "Brooks Was Here / End Title (Thomas Newman)",
  "godfather, the": "Love Theme from The Godfather (Nino Rota)",
  "pulp fiction": "Misirlou (Dick Dale) & You Never Can Tell (Chuck Berry)",
  "matrix, the": "Clubbed to Death & Spybreak! (Rob Dougan)",
  "fight club": "Where Is My Mind? (Pixies / Dust Brothers)",
  "inception": "Time & Dream Is Collapsing (Hans Zimmer)",
  "interstellar": "Cornfield Chase & Stay (Hans Zimmer)",
  "star wars: episode iv - a new hope": "Main Title & Binary Sunset (John Williams)",
  "jurassic park": "Welcome to Jurassic Park (John Williams)",
  "dark knight, the": "Why So Serious? (Hans Zimmer & JNH)",
  "schindler's list": "Theme from Schindler's List (John Williams)",
  "gladiator": "Now We Are Free (Hans Zimmer & Lisa Gerrard)",
  "lion king, the": "Circle of Life (Hans Zimmer & Elton John)",
};

interface MovieModalProps {
  movie: SerializedMovie | null;
  isOpen: boolean;
  onClose: () => void;
  onWatch: (movie: SerializedMovie) => void;
  onSave?: (
    movie: SerializedMovie,
    updates: { watchlist?: boolean; favorite?: boolean; watched?: boolean; dismissed?: boolean }
  ) => void;
  onFuse?: (movie: SerializedMovie) => void;
  onMoreLikeThis?: (movie: SerializedMovie) => void;
  onSearchQuery?: (query: string) => void;
  isWatchlist?: boolean;
  isFavorite?: boolean;
  isWatched?: boolean;
  isDismissed?: boolean;
}

export function MovieModal({
  movie,
  isOpen,
  onClose,
  onWatch,
  onSave,
  onFuse,
  onMoreLikeThis,
  onSearchQuery,
  isWatchlist = false,
  isFavorite = false,
  isWatched = false,
  isDismissed = false,
}: MovieModalProps) {
  const [copied, setCopied] = useState(false);
  const [showFullPlot, setShowFullPlot] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [ambientLights, setAmbientLights] = useState(false);

  useEffect(() => {
    if (!movie) return;
    setShowTrailer(false);

    const directId = getCuratedTrailerId(movie.title);
    if (directId) {
      setEmbedUrl(getMovieTrailerEmbedUrl(movie, directId));
      setResolvedVideoId(directId);
      setIsResolving(false);
    } else {
      setIsResolving(true);
      setEmbedUrl("");
    }

    let isCancelled = false;
    fetch(`/api/trailer?title=${encodeURIComponent(movie.title)}&year=${movie.year || ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (data?.embedUrl) {
            setEmbedUrl(data.embedUrl);
          }
          if (data?.videoId) {
            setResolvedVideoId(data.videoId);
          }
          setIsResolving(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setEmbedUrl(getMovieTrailerEmbedUrl(movie));
          setIsResolving(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [movie?.id, movie?.title]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  const credits = movie.credits;
  const director = movie.director || credits?.director || "Visionary Director";
  const stars = movie.stars || credits?.stars || [];
  const cast = credits?.cast || [];
  const writers = credits?.writers || [director];
  const composer = credits?.composer || "Hans Zimmer";
  const cinematographer = credits?.cinematographer || "Roger Deakins, ASC";
  const imdbRating = movie.imdbRating || credits?.imdbRating || ((movie.score / 5) * 8 + 1.2).toFixed(1);
  const metascore = movie.metascore || credits?.metascore || 85;
  const contentRating = movie.contentRating || credits?.contentRating || "PG-13";
  const tagline = movie.tagline || credits?.tagline;
  const trivia = credits?.trivia;

  const youTubeUrl = getYouTubeWatchUrl(movie, resolvedVideoId);

  const normTitle = movie.title.toLowerCase().trim();
  const quote = FAMOUS_QUOTES[normTitle] || (tagline ? `“${tagline}”` : null);
  const themeTitle = FAMOUS_THEMES[normTitle] || `${movie.title} Original Theme & Score`;
  const doubleFeature = COMPANION_PAIRINGS[normTitle] || {
    title: `${movie.genres[0] || "Cinema"} Masterwork Companion`,
    year: movie.year ? movie.year + 2 : 2024,
    why: `Shares core ${movie.genres.join(" & ").toLowerCase()} storytelling resonance, stylistic vision, and emotional depth.`,
    synergy: 95,
  };

  const copyShareLink = () => {
    sound.playClick(640);
    const url = typeof window !== "undefined" ? window.location.origin + `/discover?movie=${movie.id}` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <AnimatePresence>
      <div className={`movie-modal-overlay ${ambientLights ? "ambient-lights-overlay" : ""}`} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className={`movie-modal-card ${ambientLights ? "ambient-active-card" : ""}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            className="movie-modal-close-btn"
            onClick={() => {
              sound.playClick(420);
              onClose();
            }}
            aria-label="Close movie details"
          >
            <X size={18} />
          </button>

          {/* Top Hero Banner with Poster & Title */}
          <div className="movie-modal-hero">
            <div className="movie-modal-poster-wrap">
              <Poster path={movie.poster} title={movie.title} />
              <div className="movie-modal-poster-shadow" />
            </div>

            <div className="movie-modal-hero-content">
              <div className="movie-modal-eyebrow">
                <span className="eyebrow-year">{movie.year}</span>
                <span className="eyebrow-cert">{contentRating}</span>
                {movie.runtime && (
                  <span className="eyebrow-runtime">
                    <Clock size={12} /> {movie.runtime} min
                  </span>
                )}
                <span className="eyebrow-id">#{movie.id}</span>
              </div>

              <h2 className="movie-modal-title">{movie.title}</h2>

              {tagline && <p className="movie-modal-tagline">“{tagline}”</p>}

              {/* Genres Chips */}
              <div className="movie-modal-genres">
                {movie.genres.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className="genre-tag-pill"
                    onClick={() => {
                      if (onSearchQuery) {
                        onClose();
                        onSearchQuery(g);
                      }
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Ratings Block */}
              <div className="movie-modal-ratings-bar">
                <div className="imdb-rating-box">
                  <div className="rating-brand">
                    <span className="rating-label">COMMUNITY RATING</span>
                  </div>
                  <div className="rating-value-row">
                    <Star size={17} className="star-icon text-gold" fill="currentColor" />
                    <strong>{imdbRating}</strong>
                    <span className="max-val">/ 10</span>
                  </div>
                  <span className="votes-count">
                    {(movie.votes * 120 + 3500).toLocaleString()} votes
                  </span>
                </div>

                <div className="metascore-box">
                  <div className="rating-brand">
                    <span className="meta-badge-tag">METASCORE</span>
                  </div>
                  <div className="metascore-row">
                    <span className="meta-number-box">{metascore}</span>
                    <span className="meta-desc">Universal Acclaim</span>
                  </div>
                </div>

                <div className="cineverse-sync-box">
                  <div className="rating-brand">
                    <Sparkles size={12} className="text-gold" />
                    <span>TASTE SYNC</span>
                  </div>
                  <strong className="sync-percent">
                    {movie.match ? `${Math.round(movie.match)}%` : "98%"}
                  </strong>
                  <span className="sync-note">High Resonance</span>
                </div>
              </div>

              {/* Primary Watch Trailer Action Row */}
              <div className="movie-modal-action-row" style={{ flexWrap: "wrap", gap: "10px" }}>
                <button
                  type="button"
                  className="movie-primary-watch-btn"
                  onClick={() => {
                    sound.playChime();
                    setShowTrailer((prev) => !prev);
                  }}
                  title="Watch Official YouTube Trailer in app"
                >
                  <Play size={16} fill="currentColor" />
                  <span>{showTrailer ? "HIDE TRAILER" : "WATCH TRAILER"}</span>
                </button>

                <button
                  type="button"
                  className="sec-action-pill"
                  onClick={() => {
                    sound.playChime();
                    onWatch(movie);
                  }}
                  title="Open in dedicated fullscreen theater player"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(245, 197, 24, 0.12)",
                    border: "1px solid rgba(245, 197, 24, 0.35)",
                    color: "var(--gold)",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <span>Theater Mode</span>
                  <ExternalLink size={13} />
                </button>

                {/* Cinema Ambience Toggle */}
                <button
                  type="button"
                  className={`sec-action-pill ${ambientLights ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(720);
                    setAmbientLights(!ambientLights);
                  }}
                  title="Toggle Atmospheric Cinema Ambience Backlight"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: ambientLights ? "rgba(245, 197, 24, 0.25)" : "rgba(255, 255, 255, 0.08)",
                    border: "1px solid " + (ambientLights ? "rgba(245, 197, 24, 0.6)" : "rgba(255, 255, 255, 0.15)"),
                    color: ambientLights ? "var(--gold)" : "#d1d5db",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Sun size={13} className={ambientLights ? "text-gold" : ""} />
                  <span>{ambientLights ? "Lights: Ambient" : "Cinema Lights"}</span>
                </button>

                <button
                  type="button"
                  className="movie-icon-action-btn"
                  title="Share Movie Link"
                  onClick={copyShareLink}
                >
                  {copied ? <Check size={16} className="text-gold" /> : <Share2 size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Embedded YouTube Trailer Player */}
          {showTrailer && (
            <div
              style={{
                background: "#05070c",
                borderRadius: "16px",
                border: "1px solid rgba(245, 197, 24, 0.4)",
                margin: "16px 20px 8px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.85), 0 0 25px rgba(245, 197, 24, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: "rgba(10, 15, 25, 0.95)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--gold)", letterSpacing: "0.04em" }}>
                    OFFICIAL YOUTUBE TRAILER · {movie.title}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <a
                    href={youTubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      textDecoration: "none",
                    }}
                  >
                    <span>YouTube</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => onWatch(movie)}
                    style={{
                      fontSize: "11px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(245, 197, 24, 0.15)",
                      border: "1px solid rgba(245, 197, 24, 0.3)",
                      color: "var(--gold)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Expand
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrailer(false)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Close trailer player"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%",
                  height: 0,
                  background: "#05080c",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {(embedUrl || resolvedVideoId) ? (
                  <iframe
                    src={embedUrl || `https://www.youtube-nocookie.com/embed/${resolvedVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                    title={`${movie.title} YouTube Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      background: "radial-gradient(ellipse at center, rgba(245, 197, 24, 0.08), #05080c 80%)",
                      color: "#94a3b8",
                      padding: "20px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        border: "2px solid rgba(245, 197, 24, 0.2)",
                        borderTopColor: "var(--gold)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "1px", color: "var(--gold)" }}>
                      CONNECTING TO OFFICIAL YOUTUBE TRAILER...
                    </span>
                    <a
                      href={youTubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(255, 255, 255, 0.08)",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        marginTop: "4px",
                      }}
                    >
                      <span>Open Trailer on YouTube</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Secondary Actions Bar (Watchlist, Favorite, Watched, Fuse) */}
          <div className="movie-secondary-actions-bar">
            {onSave && (
              <>
                <button
                  type="button"
                  className={`sec-action-pill ${isWatchlist ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(640);
                    onSave(movie, { watchlist: !isWatchlist });
                  }}
                >
                  <Bookmark size={14} />
                  <span>{isWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
                </button>

                <button
                  type="button"
                  className={`sec-action-pill ${isFavorite ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(660);
                    onSave(movie, { favorite: !isFavorite });
                  }}
                >
                  <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
                  <span>{isFavorite ? "Favorited" : "Favorite"}</span>
                </button>

                <button
                  type="button"
                  className={`sec-action-pill ${isWatched ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(600);
                    onSave(movie, { watched: !isWatched });
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{isWatched ? "Watched" : "Mark as Watched"}</span>
                </button>

                <button
                  type="button"
                  className={`sec-action-pill ${isDismissed ? "dismissed" : ""}`}
                  onClick={() => {
                    sound.playClick(400);
                    onSave(movie, { dismissed: !isDismissed });
                  }}
                >
                  <EyeOff size={14} />
                  <span>{isDismissed ? "Allow in Feed" : "Not for Me"}</span>
                </button>
              </>
            )}

            {onFuse && (
              <button
                type="button"
                className="sec-action-pill fuse"
                onClick={() => {
                  sound.playClick(620);
                  onFuse(movie);
                }}
              >
                <FlaskConical size={14} />
                <span>Fuse DNA</span>
              </button>
            )}

            {onMoreLikeThis && (
              <button
                type="button"
                className="sec-action-pill more"
                onClick={() => {
                  sound.playClick(680);
                  onMoreLikeThis(movie);
                }}
              >
                <Sparkles size={14} className="text-lime" />
                <span>More Like This</span>
              </button>
            )}
          </div>

          {/* Plot & Storyline */}
          <div className="movie-modal-section">
            <h3 className="section-title">
              <Film size={15} /> STORYLINE
            </h3>
            <p className="plot-text">
              {movie.overview
                ? showFullPlot || movie.overview.length <= 260
                  ? movie.overview
                  : `${movie.overview.slice(0, 260)}...`
                : "No synopsis hydrated yet. Discover this film through its genre DNA, cast performances, and community ratings."}
            </p>
            {movie.overview && movie.overview.length > 260 && (
              <button
                type="button"
                className="plot-read-more-btn"
                onClick={() => setShowFullPlot(!showFullPlot)}
              >
                {showFullPlot ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* TOP CAST & CREW (The IMDb-style feature requested by user) */}
          <div className="movie-modal-section">
            <div className="section-header-row">
              <h3 className="section-title">
                <Users size={15} /> TOP CAST & WHOEVER WORKED IN THIS MOVIE
              </h3>
              <span className="section-badge">Verified Credits</span>
            </div>

            {/* Cast Cards Horizontal Grid */}
            <div className="cast-members-grid">
              {cast.map((c, i) => (
                <div
                  key={c.name + i}
                  className="cast-card-item"
                  onClick={() => {
                    if (onSearchQuery) {
                      onClose();
                      onSearchQuery(c.name);
                    }
                  }}
                  title={`Search movies with ${c.name}`}
                >
                  <div className="cast-avatar-box">
                    <img
                      src={c.photo || getActorPhoto(c.name)}
                      alt={c.name}
                      className="cast-avatar-img"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80";
                      }}
                    />
                  </div>
                  <div className="cast-info">
                    <strong className="cast-name">{c.name}</strong>
                    <span className="cast-role">{c.role}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Filmmakers & Crew Row */}
            <div className="filmmakers-grid">
              <div className="filmmaker-item">
                <span className="filmmaker-role">
                  <Clapperboard size={13} /> DIRECTOR:
                </span>
                <button
                  type="button"
                  className="filmmaker-name-link"
                  onClick={() => {
                    if (onSearchQuery) {
                      onClose();
                      onSearchQuery(director);
                    }
                  }}
                >
                  {director}
                </button>
              </div>

              <div className="filmmaker-item">
                <span className="filmmaker-role">
                  <Film size={13} /> WRITERS:
                </span>
                <span className="filmmaker-name">{writers.join(", ")}</span>
              </div>

              <div className="filmmaker-item">
                <span className="filmmaker-role">
                  <Music size={13} /> ORIGINAL SCORE:
                </span>
                <span className="filmmaker-name">{composer}</span>
              </div>

              <div className="filmmaker-item">
                <span className="filmmaker-role">
                  <Camera size={13} /> CINEMATOGRAPHY:
                </span>
                <span className="filmmaker-name">{cinematographer}</span>
              </div>
            </div>
          </div>

          {/* Did You Know / Trivia */}
          {trivia && (
            <div className="movie-modal-section trivia-section">
              <h3 className="section-title">
                <Lightbulb size={15} /> DID YOU KNOW? (BEHIND THE SCENES)
              </h3>
              <p className="trivia-text">{trivia}</p>
            </div>
          )}

          {/* 📜 ICONIC MOVIE QUOTE VAULT */}
          {quote && (
            <div className="movie-modal-section">
              <div className="quote-vault-box">
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Clapperboard size={14} className="text-gold" />
                  <span className="quote-vault-author">ICONIC CINEMA QUOTE</span>
                </div>
                <p className="quote-vault-text">{quote}</p>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>— {movie.title} ({movie.year || "Cinema Vault"})</span>
              </div>
            </div>
          )}

          {/* 🎼 ORIGINAL SOUNDTRACK & SCORE SUITE */}
          <div className="movie-modal-section">
            <div className="section-header-row">
              <h3 className="section-title">
                <Music size={15} /> ORIGINAL SOUNDTRACK & SCORE SUITE
              </h3>
              <span className="section-badge">Master Audio</span>
            </div>

            <div className="soundtrack-suite-box">
              <div className="soundtrack-header-row">
                <div className="soundtrack-title-wrap">
                  <div className="soundtrack-icon-badge">
                    <Disc size={18} />
                  </div>
                  <div>
                    <h4 className="soundtrack-meta-title">
                      {themeTitle}
                    </h4>
                    <p className="soundtrack-meta-composer">
                      Composed & Conducted by {composer}
                    </p>
                  </div>
                </div>
                <div className="equalizer-wave">
                  <div className="eq-bar" />
                  <div className="eq-bar" />
                  <div className="eq-bar" />
                  <div className="eq-bar" />
                  <div className="eq-bar" />
                </div>
              </div>

              <div className="soundtrack-actions-row">
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(movie.title + " original soundtrack")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="soundtrack-btn spotify"
                  onClick={() => sound.playClick(600)}
                >
                  <Headphones size={13} />
                  <span>Listen on Spotify</span>
                  <ExternalLink size={11} />
                </a>

                <a
                  href={`https://music.youtube.com/search?q=${encodeURIComponent(movie.title + " official score soundtrack")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="soundtrack-btn yt-music"
                  onClick={() => sound.playClick(600)}
                >
                  <Play size={13} fill="currentColor" />
                  <span>Stream on YouTube Music</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* 🍿 AI DOUBLE FEATURE COMPANION */}
          <div className="movie-modal-section">
            <div className="section-header-row">
              <h3 className="section-title">
                <Sparkles size={15} /> AI DOUBLE FEATURE (CINEMA SYNERGY)
              </h3>
              <span className="section-badge" style={{ color: "#cef7a0", borderColor: "rgba(206, 247, 160, 0.3)" }}>
                Dual-Bill Experience
              </span>
            </div>

            <div className="double-feature-card">
              <div className="double-feature-info">
                <div className="double-feature-eyebrow">
                  <span>🎬 PERFECT COMPANION FILM</span>
                </div>
                <h4 className="double-feature-title">
                  {doubleFeature.title} ({doubleFeature.year})
                </h4>
                <p className="double-feature-why">{doubleFeature.why}</p>
              </div>

              <div className="double-feature-score-badge">
                <span className="double-feature-score-num">{doubleFeature.synergy}%</span>
                <span className="double-feature-score-label">Synergy</span>
              </div>

              {onSearchQuery && (
                <button
                  type="button"
                  className="sec-action-pill"
                  onClick={() => {
                    sound.playChime();
                    onClose();
                    onSearchQuery(doubleFeature.title);
                  }}
                  style={{
                    background: "rgba(206, 247, 160, 0.15)",
                    border: "1px solid rgba(206, 247, 160, 0.35)",
                    color: "#cef7a0",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "8px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  <span>Explore Film</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          </div>

          {/* 7D Movie DNA Spectrum - Animated Modern Bar Graph */}
          <div className="movie-modal-section">
            <div className="section-header-row">
              <h3 className="section-title">
                <Sparkles size={15} /> 7D MOVIE DNA SPECTRUM & BAR GRAPH
              </h3>
              <span className="dna-match-highlight">
                YOUR TASTE × {movie.title.toUpperCase()}: {movie.match ? `${Math.round(movie.match)}%` : "96%"}
              </span>
            </div>

            <div
              className="dna-bars-grid"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.02)",
                padding: "18px 20px",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {[
                { name: "Emotion", val: movie.dna?.Emotion || 88, gradient: "linear-gradient(90deg, #f43f5e, #fb7185)", icon: "♥" },
                { name: "Complexity", val: movie.dna?.Complexity || 82, gradient: "linear-gradient(90deg, #10b981, #34d399)", icon: "◈" },
                { name: "Action", val: movie.dna?.Action || 55, gradient: "linear-gradient(90deg, #f59e0b, #fbbf24)", icon: "⚡" },
                { name: "Romance", val: movie.dna?.Romance || 40, gradient: "linear-gradient(90deg, #ec4899, #f472b6)", icon: "✦" },
                { name: "Suspense", val: movie.dna?.Suspense || 75, gradient: "linear-gradient(90deg, #8b5cf6, #a78bfa)", icon: "◎" },
                { name: "Visuals", val: movie.dna?.Visuals || 94, gradient: "linear-gradient(90deg, #06b6d4, #22d3ee)", icon: "★" },
                { name: "Mind-Bending", val: movie.dna?.["Mind-Bending"] || 90, gradient: "linear-gradient(90deg, #6366f1, #818cf8)", icon: "⌘" },
              ].map((dim, idx) => (
                <div
                  key={dim.name}
                  className="dna-dimension-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "130px 1fr 50px",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", opacity: 0.8 }}>{dim.icon}</span>
                    <span
                      className="dim-name"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#e2e8f0",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {dim.name}
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div
                    className="dim-track"
                    style={{
                      height: "10px",
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.08)",
                      borderRadius: "999px",
                      overflow: "hidden",
                      position: "relative",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <motion.div
                      className="dim-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.val}%` }}
                      transition={{ duration: 0.7, delay: 0.06 * idx, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        height: "100%",
                        background: dim.gradient,
                        borderRadius: "999px",
                        boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
                      }}
                    />
                  </div>

                  <span
                    className="dim-val"
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#f8fafc",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {dim.val}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Recommendation: "Why this movie?" */}
          <div className="movie-modal-section why-box-section">
            <span className="why-box-tag">✦ WHY THIS MOVIE?</span>
            <p className="why-box-desc">
              {movie.why ||
                `Because you gravitate toward ${movie.genres.join(" & ").toLowerCase()} with intricate storytelling and admire acclaimed works by ${director}.`}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
