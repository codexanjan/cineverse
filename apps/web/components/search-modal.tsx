"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Play,
  Star,
  Film,
  Sparkles,
  Users,
  Clapperboard,
  Clock,
  ArrowRight,
  TrendingUp,
  History,
} from "lucide-react";
import { SerializedMovie } from "../lib/catalog-service";
import { Poster } from "./poster";
import { sound } from "../lib/sound";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMovie?: (movie: SerializedMovie) => void;
  onWatchMovie: (movie: SerializedMovie) => void;
}

const TRENDING_SEARCHES = [
  "Inception",
  "Interstellar",
  "The Dark Knight",
  "Pulp Fiction",
  "Heat",
  "Spirited Away",
  "Seven",
  "Casino",
  "The Matrix",
  "Fight Club",
];

const GENRE_FILTERS = [
  "All",
  "Sci-Fi",
  "Action",
  "Drama",
  "Crime",
  "Animation",
  "Comedy",
  "Thriller",
];

export function SearchModal({
  isOpen,
  onClose,
  onSelectMovie,
  onWatchMovie,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [results, setResults] = useState<SerializedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cineverse_recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem("cineverse_recent_searches", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Fetch default trending / popular movies if empty
      if (!query) {
        fetchResults("", selectedGenre);
      }
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchResults(query, selectedGenre);
    }, 180);
    return () => clearTimeout(timer);
  }, [query, selectedGenre, isOpen]);

  const fetchResults = async (q: string, genre: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (genre && genre !== "All") params.set("genre", genre);
      params.set("limit", "18");
      params.set("sort", q ? "popular" : "rating");

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.items || []);
      }
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecent = (term: string) => {
    sound.playClick(540);
    setQuery(term);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="search-modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="search-modal-container"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Top Search Input Box */}
          <div className="search-modal-input-bar">
            <Search size={20} className="search-input-icon text-lime" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  saveRecentSearch(query);
                }
              }}
              placeholder="Search by title, director (Nolan, Tarantino), actor (DiCaprio, Pitt), or genre..."
              className="search-modal-input"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                <X size={16} />
              </button>
            )}
            <div className="search-modal-badge">
              <span>ESC to close</span>
            </div>
            <button
              type="button"
              className="search-modal-close-btn"
              onClick={onClose}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>

          {/* Genre Filters & Quick Pills */}
          <div className="search-filters-bar">
            <span className="search-filter-label">GENRES:</span>
            <div className="search-genre-pills">
              {GENRE_FILTERS.map((g) => {
                const active = selectedGenre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    className={`search-filter-pill ${active ? "active" : ""}`}
                    onClick={() => {
                      sound.playClick(600);
                      setSelectedGenre(g);
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent and Trending Suggestions (shown when query is empty) */}
          {!query && (
            <div className="search-suggestions-box">
              {recentSearches.length > 0 && (
                <div className="search-suggestion-section">
                  <span className="suggestion-heading">
                    <History size={13} /> RECENT SEARCHES:
                  </span>
                  <div className="suggestion-tags">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        className="suggestion-tag"
                        onClick={() => handleSelectRecent(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-suggestion-section">
                <span className="suggestion-heading">
                  <TrendingUp size={13} /> TRENDING ON CINEVERSE:
                </span>
                <div className="suggestion-tags">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="suggestion-tag trending"
                      onClick={() => handleSelectRecent(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="search-results-scrollable">
            {loading ? (
              <div className="search-loading-state">
                <span className="search-spinner" />
                <p>Searching cineverse neural catalog...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="search-results-grid">
                {results.map((m) => {
                  const imdbRating = m.imdbRating || ((m.score / 5) * 8 + 1.2).toFixed(1);
                  const director = m.director || m.credits?.director || "Renowned Director";
                  const stars = m.stars || m.credits?.stars || [];

                  return (
                    <motion.div
                      key={m.id}
                      className="search-result-card"
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                      onClick={() => {
                        saveRecentSearch(m.title);
                        sound.playClick(620);
                        if (onSelectMovie) onSelectMovie(m);
                        else onWatchMovie(m);
                      }}
                    >
                      {/* Poster Thumbnail */}
                      <div className="search-card-poster">
                        <Poster path={m.poster} title={m.title} />
                      </div>

                      {/* Movie Information */}
                      <div className="search-card-info">
                        <div className="search-card-header">
                          <h4 className="search-card-title">{m.title}</h4>
                          <span className="search-card-year">{m.year}</span>
                        </div>

                        {/* Badges: Rating, Genres, Runtime */}
                        <div className="search-card-meta-chips">
                          <span className="search-chip-rating">
                            <Star size={11} className="star-icon" /> {imdbRating}
                          </span>
                          <span className="search-chip-genre">
                            {m.genres.slice(0, 2).join(" · ")}
                          </span>
                          {m.runtime && (
                            <span className="search-chip-runtime">
                              <Clock size={11} /> {m.runtime}m
                            </span>
                          )}
                        </div>

                        {/* Cast & Director Preview */}
                        <div className="search-card-credits">
                          <span className="credits-director">
                            <Clapperboard size={12} /> {director}
                          </span>
                          {stars.length > 0 && (
                            <span className="credits-stars">
                              <Users size={12} /> {stars.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>

                        {/* Brief Plot snippet */}
                        {m.overview && (
                          <p className="search-card-plot">
                            {m.overview.slice(0, 110)}...
                          </p>
                        )}
                      </div>

                      {/* Action Buttons: Watch Trailer & Details */}
                      <div className="search-card-actions">
                        <button
                          type="button"
                          className="search-action-btn watch-btn"
                          title={`Watch Official Trailer for ${m.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRecentSearch(m.title);
                            sound.playClick(680);
                            onWatchMovie(m);
                          }}
                        >
                          <Play size={13} fill="currentColor" />
                          <span>Trailer</span>
                        </button>
                        <button
                          type="button"
                          className="search-action-btn details-btn"
                          title="View Full Cast & Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRecentSearch(m.title);
                            if (onSelectMovie) onSelectMovie(m);
                            else onWatchMovie(m);
                          }}
                        >
                          <span>Details</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="search-empty-state">
                <Film size={36} className="empty-icon" />
                <h3>No movies found for "{query}"</h3>
                <p>Try searching for a different title, actor, director, or genre filter.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
