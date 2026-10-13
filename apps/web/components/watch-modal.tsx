"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  ExternalLink,
  Film,
  Star,
  Maximize2,
  Minimize2,
  ChevronDown,
  Clock,
  Share2,
  Check,
} from "lucide-react";
import { SerializedMovie } from "../lib/catalog-service";
import { sound } from "../lib/sound";
import { getMovieTrailerEmbedUrl, getYouTubeWatchUrl, getCuratedTrailerId } from "../lib/trailer";

interface WatchModalProps {
  movie: SerializedMovie | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDetails?: (movie: SerializedMovie) => void;
}

export function WatchModal({
  movie,
  isOpen,
  onClose,
  onOpenDetails,
}: WatchModalProps) {
  const [copied, setCopied] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [resolvedVideoId, setResolvedVideoId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  useEffect(() => {
    if (!movie) return;
    setIsMinimized(false);

    const directId = getCuratedTrailerId(movie.title);
    if (directId) {
      setEmbedUrl(getMovieTrailerEmbedUrl(movie, directId));
      setResolvedVideoId(directId);
      setIsResolving(false);
    } else {
      setIsResolving(true);
      setEmbedUrl("");
    }

    // Asynchronously resolve precise official trailer from /api/trailer
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
        if (isMinimized) {
          setIsMinimized(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMinimized, onClose]);

  if (!isOpen || !movie) return null;

  const trailerEmbedUrl = embedUrl || getMovieTrailerEmbedUrl(movie, resolvedVideoId);
  const youTubeUrl = getYouTubeWatchUrl(movie, resolvedVideoId);

  const copyShareLink = () => {
    sound.playClick(640);
    const url = typeof window !== "undefined" ? `${window.location.origin}/discover?movie=${movie.id}` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isMinimized ? (
        /* 📱 Floating Mini-Player Dock (Bottom-Right, continues playing!) */
        <motion.div
          key="minimized-dock"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "360px",
            zIndex: 100,
            background: "#080c14",
            border: "1px solid rgba(245, 197, 24, 0.35)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -10px rgba(0,0,0,0.9), 0 0 25px rgba(245, 197, 24, 0.15)",
          }}
        >
          {/* Mini-Player Top Controls Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "rgba(13, 19, 33, 0.95)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={() => setIsMinimized(false)}
              title="Click to extend trailer"
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--gold, #f5c518)",
                  boxShadow: "0 0 8px #f5c518",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                }}
              >
                {movie.title}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                className="mini-player-btn"
                onClick={() => {
                  sound.playClick(600);
                  setIsMinimized(false);
                }}
                title="Extend Trailer to Full View"
                aria-label="Maximize"
              >
                <Maximize2 size={13} />
              </button>
              <button
                type="button"
                className="mini-player-btn close-btn"
                onClick={() => {
                  sound.playClick(440);
                  setIsMinimized(false);
                  onClose();
                }}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Active 16:9 Mini Video Frame */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: "56.25%",
              height: 0,
              background: "#000",
            }}
          >
            {isResolving && !trailerEmbedUrl ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#0a0f18",
                  color: "var(--gold, #f5c518)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                Loading Trailer...
              </div>
            ) : (
              <iframe
                src={trailerEmbedUrl}
                title={`${movie.title} Trailer`}
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
            )}
          </div>
        </motion.div>
      ) : (
        /* 🎬 Full Modal Overlay Player */
        <div className="watch-modal-overlay" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`watch-modal-container ${theaterMode ? "theater-mode" : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Subtle Ambient Backlight */}
            <div className="watch-modal-ambient-glow" />

            {/* Minimalist Top Header */}
            <div className="watch-modal-header">
              <div className="watch-modal-title-group">
                <div className="watch-trailer-badge">
                  <span className="live-dot" /> OFFICIAL YOUTUBE TRAILER
                </div>
                <h2>{movie.title}</h2>
                <div className="watch-modal-meta">
                  {movie.year && <span className="meta-pill">{movie.year}</span>}
                  {movie.contentRating && <span className="meta-pill">{movie.contentRating}</span>}
                  {movie.runtime && (
                    <span className="meta-pill">
                      <Clock size={11} /> {movie.runtime}m
                    </span>
                  )}
                  {movie.score && (
                    <span className="meta-pill gold-pill">
                      <Star size={11} fill="currentColor" /> {movie.score.toFixed(1)}
                    </span>
                  )}
                  {movie.genres?.slice(0, 2).map((g) => (
                    <span key={g} className="meta-pill genre">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Controls: YouTube Link, Theater Mode, Dock to Mini, Close */}
              <div className="watch-modal-controls">
                <a
                  href={youTubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-ctrl-btn youtube-link-btn"
                  title="Open on YouTube"
                >
                  <span>YouTube</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  type="button"
                  className="watch-ctrl-btn"
                  onClick={copyShareLink}
                  title="Share Movie Link"
                >
                  {copied ? <Check size={14} className="text-gold" /> : <Share2 size={14} />}
                </button>

                <button
                  type="button"
                  className={`watch-ctrl-btn ${theaterMode ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(680);
                    setTheaterMode(!theaterMode);
                  }}
                  title={theaterMode ? "Exit Theater Mode" : "Expand to Theater Mode"}
                >
                  {theaterMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                <button
                  type="button"
                  className="watch-ctrl-btn"
                  onClick={() => {
                    sound.playClick(520);
                    setIsMinimized(true);
                  }}
                  title="Minimize to Floating PiP Player"
                >
                  <ChevronDown size={17} />
                </button>

                <button
                  type="button"
                  className="watch-ctrl-btn close-btn"
                  onClick={() => {
                    sound.playClick(440);
                    onClose();
                  }}
                  aria-label="Close Trailer Player"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Main Video Player Container (Cinema 16:9 Aspect Ratio) */}
            <div
              className="watch-video-viewport"
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%",
                height: 0,
                background: "#05070c",
                overflow: "hidden",
              }}
            >
              {(!trailerEmbedUrl && !resolvedVideoId) ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#080c14",
                    color: "#f5c518",
                    gap: "14px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "3px solid rgba(245, 197, 24, 0.2)",
                      borderTopColor: "var(--gold, #f5c518)",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.5px" }}>
                    Connecting Official Trailer for {movie.title}...
                  </span>
                  <a
                    href={youTubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(245, 197, 24, 0.15)",
                      border: "1px solid rgba(245, 197, 24, 0.4)",
                      color: "var(--gold)",
                      padding: "10px 20px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "13px",
                      marginTop: "6px",
                    }}
                  >
                    <span>Play on YouTube</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <iframe
                  src={trailerEmbedUrl || `https://www.youtube-nocookie.com/embed/${resolvedVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title={`${movie.title} Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="watch-video-iframe"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              )}
            </div>

            {/* Minimal Movie Details Bar Below Video */}
            <div className="watch-modal-footer">
              <div className="watch-footer-left">
                <p className="watch-movie-overview">{movie.overview}</p>
                {movie.director && (
                  <span className="watch-director-tag">Directed by {movie.director}</span>
                )}
              </div>

              {onOpenDetails && (
                <button
                  type="button"
                  className="watch-details-btn"
                  onClick={() => {
                    sound.playClick(580);
                    onOpenDetails(movie);
                  }}
                >
                  <span>Full Film Cast & Details</span>
                  <Film size={13} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
