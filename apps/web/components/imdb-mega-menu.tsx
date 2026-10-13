"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  Film,
  Tv,
  Play,
  Award,
  Users,
  Globe,
  Star,
  ExternalLink,
  Sparkles,
  Ticket,
  Calendar,
  Flame,
  Radio,
  Clapperboard,
  Compass,
  Zap,
} from "lucide-react";
import { sound } from "../lib/sound";

interface ImdbMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGenre?: (genre: string) => void;
  onOpenSearch?: () => void;
  onOpenWatch?: () => void;
  onOpenTonight?: () => void;
}

export function ImdbMegaMenu({
  isOpen,
  onClose,
  onSelectGenre,
  onOpenSearch,
  onOpenWatch,
  onOpenTonight,
}: ImdbMegaMenuProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLinkClick = () => {
    sound.playClick(620);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="imdb-menu-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.98 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="imdb-menu-container"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Top Brand & Close Bar */}
          <div className="imdb-menu-topbar">
            <div className="imdb-menu-brand-group">
              <span className="imdb-brand-logo">IMDb</span>
              <span className="menu-brand-divider">×</span>
              <span className="cineverse-brand-tag">CINEVERSE CINEMA</span>
              <span className="menu-cinema-badge">CINEMATIC EXP</span>
            </div>

            <button
              type="button"
              className="imdb-menu-close-btn"
              onClick={() => {
                sound.playClick(420);
                onClose();
              }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mega Grid of Cinema Categories */}
          <div className="imdb-menu-grid">
            {/* COLUMN 1: MOVIES */}
            <div className="imdb-menu-col">
              <div className="menu-col-header">
                <Film className="col-icon text-gold" size={20} />
                <h3>Movies</h3>
              </div>
              <ul className="menu-links-list">
                <li>
                  <Link href="/discover?sort=rating" onClick={handleLinkClick}>
                    <span>Top 250 Movies</span>
                    <span className="menu-link-tag gold">★ 9.0+</span>
                  </Link>
                </li>
                <li>
                  <Link href="/discover?sort=popular" onClick={handleLinkClick}>
                    <span>Most Popular Movies</span>
                    <span className="menu-link-tag">Hot</span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="menu-action-link"
                    onClick={() => {
                      sound.playClick(650);
                      onClose();
                      onOpenSearch?.();
                    }}
                  >
                    <span>Browse Movies by Genre</span>
                    <span className="menu-link-tag">19 Genres</span>
                  </button>
                </li>
                <li>
                  <Link href="/discover?tab=Gems" onClick={handleLinkClick}>
                    <span>Top Box Office & Hidden Gems</span>
                    <span className="menu-link-tag lime">Serendipity</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/calendar/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Release Calendar</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/showtimes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Showtimes & Tickets</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/news/movie/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Movie News</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/india/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>India Movie Spotlight</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 2: TV SHOWS */}
            <div className="imdb-menu-col">
              <div className="menu-col-header">
                <Tv className="col-icon text-gold" size={20} />
                <h3>TV Shows</h3>
              </div>
              <ul className="menu-links-list">
                <li>
                  <Link href="/discover?tab=Tonight+mode" onClick={handleLinkClick}>
                    <span>What's on TV & Streaming</span>
                    <span className="menu-link-tag lime">Tonight</span>
                  </Link>
                </li>
                <li>
                  <Link href="/discover?sort=rating" onClick={handleLinkClick}>
                    <span>Top 250 TV Shows</span>
                  </Link>
                </li>
                <li>
                  <Link href="/discover?sort=popular" onClick={handleLinkClick}>
                    <span>Most Popular TV Shows</span>
                  </Link>
                </li>
                <li>
                  <Link href="/categories" onClick={handleLinkClick}>
                    <span>Browse TV by Genre & Universes</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/news/tv/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>TV News & Renewals</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
              </ul>

              {/* WATCH SECTION IN SAME COLUMN */}
              <div className="menu-col-header" style={{ marginTop: "28px" }}>
                <Play className="col-icon text-gold" size={20} fill="currentColor" />
                <h3>Watch</h3>
              </div>
              <ul className="menu-links-list">
                <li>
                  <button
                    type="button"
                    className="menu-action-link"
                    onClick={() => {
                      sound.playChime();
                      onClose();
                      onOpenTonight?.();
                    }}
                  >
                    <span>What to Watch Tonight</span>
                    <span className="menu-link-tag lime">⚡ AI Pick</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="menu-action-link"
                    onClick={() => {
                      sound.playChime();
                      onClose();
                      onOpenWatch?.();
                    }}
                  >
                    <span>Latest Trailers & Stream Hub</span>
                    <span className="menu-link-tag gold">4K HDR</span>
                  </button>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/originals/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>IMDb Originals</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamdb.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Steam DB Servers & Mirrors</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.justwatch.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>JustWatch Streaming Guide</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: AWARDS & EVENTS */}
            <div className="imdb-menu-col">
              <div className="menu-col-header">
                <Award className="col-icon text-gold" size={20} />
                <h3>Awards & Events</h3>
              </div>
              <ul className="menu-links-list">
                <li>
                  <a
                    href="https://www.imdb.com/oscars/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Oscars (Academy Awards)</span>
                    <span className="menu-link-tag gold">Academy</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/emmys/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Primetime Emmys</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/toronto-international-film-festival/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Toronto Int'l Film Festival</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/cannes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Cannes Film Festival</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/starmeterawards/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>STARmeter Awards</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/awards-central/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Awards Central</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/festival-central/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Festival Central</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: CELEBS & COMMUNITY */}
            <div className="imdb-menu-col">
              <div className="menu-col-header">
                <Users className="col-icon text-gold" size={20} />
                <h3>Celebs & Cast</h3>
              </div>
              <ul className="menu-links-list">
                <li>
                  <button
                    type="button"
                    className="menu-action-link"
                    onClick={() => {
                      sound.playClick(650);
                      onClose();
                      onOpenSearch?.();
                    }}
                  >
                    <span>Search Cast & Directors</span>
                    <span className="menu-link-tag lime">Cast Database</span>
                  </button>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/feature/born-today/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Born Today</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/list/ls058011111/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Most Popular Celebs</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.imdb.com/news/celebrity/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Celebrity News & Interviews</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
              </ul>

              {/* COMMUNITY SECTION */}
              <div className="menu-col-header" style={{ marginTop: "28px" }}>
                <Globe className="col-icon text-gold" size={20} />
                <h3>Community</h3>
              </div>
              <ul className="menu-links-list">
                <li>
                  <Link href="/discover?tab=Group+night" onClick={handleLinkClick}>
                    <span>Group Watch Night Party</span>
                    <span className="menu-link-tag lime">Co-Watch</span>
                  </Link>
                </li>
                <li>
                  <Link href="/discover?tab=Swipe+mode" onClick={handleLinkClick}>
                    <span>Swipe Deck Calibration</span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile" onClick={handleLinkClick}>
                    <span>Your Taste DNA & Lists</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://help.imdb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>IMDb Help Center</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://contribute.imdb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                  >
                    <span>Contributor Zone & Polls</span>
                    <ExternalLink size={12} className="link-ext-icon" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Footer Links Bar */}
          <div className="imdb-menu-footer">
            <div className="menu-footer-links">
              <Link href="/discover" onClick={handleLinkClick}>
                🎬 Full 9,700+ Movies Database
              </Link>
              <span>·</span>
              <button
                type="button"
                className="footer-btn-link"
                onClick={() => {
                  sound.playClick(600);
                  onClose();
                  onOpenSearch?.();
                }}
              >
                🔍 Universal Search (⌘K)
              </button>
              <span>·</span>
              <a
                href="https://steamdb.info/"
                target="_blank"
                rel="noopener noreferrer"
              >
                🎮 Steam DB Mirror
              </a>
              <span>·</span>
              <a
                href="https://www.imdb.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ⭐ Official IMDb Hub
              </a>
            </div>
            <div className="menu-footer-badge">
              <span>✦ Cineverse AI × IMDb Engine · Powered by TMDB & MovieLens</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
