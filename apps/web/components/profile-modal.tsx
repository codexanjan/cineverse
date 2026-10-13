"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  User,
  Star,
  Film,
  Bookmark,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  Award,
  Zap,
} from "lucide-react";
import { sound } from "../lib/sound";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName?: string;
  watchedCount?: number;
  watchlistCount?: number;
  ratingsCount?: number;
  dna?: Record<string, number>;
}

export function ProfileModal({
  isOpen,
  onClose,
  profileName = "Cinephile Curator",
  watchedCount = 42,
  watchlistCount = 18,
  ratingsCount = 36,
  dna = {
    Emotion: 88,
    Complexity: 86,
    Action: 58,
    Romance: 44,
    Suspense: 78,
    Visuals: 94,
    "Mind-Bending": 92,
  },
}: ProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [avatar, setAvatar] = useState("✦");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cineverse_avatar");
      if (saved) setAvatar(saved);
      const savedName = localStorage.getItem("cineverse_username");
      if (savedName) profileName = savedName;
    }
  }, [isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    sound.playClick(620);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
        if (typeof window !== "undefined") {
          localStorage.setItem("cineverse_avatar", dataUrl);
        }
        sound.playChime();
      }
    };
    reader.readAsDataURL(file);
  };

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

  const copyProfileLink = () => {
    sound.playClick(640);
    const url = typeof window !== "undefined" ? window.location.origin + `/profile` : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const isCustomPhoto = Boolean(
    avatar &&
    (avatar.startsWith("data:") || avatar.startsWith("http") || avatar.startsWith("/"))
  );

  const topGenres = ["Sci-Fi", "Mystery", "Drama", "Psychological Thriller", "Auteur Cinema"];

  return (
    <AnimatePresence>
      <div
        className="profile-modal-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(4, 7, 13, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          zIndex: 9999,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="profile-modal-card"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "620px",
            background: "#0c1019",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "24px",
            boxShadow: "0 30px 80px -15px rgba(0, 0, 0, 0.95), 0 0 30px rgba(245, 197, 24, 0.08)",
            padding: "32px",
            color: "#f8fafc",
            overflow: "hidden",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={() => {
              sound.playClick(420);
              onClose();
            }}
            aria-label="Close profile"
          >
            <X size={18} />
          </button>

          {/* Hidden File Input for Device Photo Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />

          {/* Ambient Glow */}
          <div className="profile-modal-glow" />

          {/* Header & Avatar Card */}
          <div className="profile-modal-header">
            <div className="profile-avatar-wrapper">
              <div
                className="profile-avatar-circle"
                style={{
                  overflow: "hidden",
                  border: isCustomPhoto ? "2px solid var(--gold)" : undefined,
                  boxShadow: isCustomPhoto ? "0 0 16px rgba(251, 191, 36, 0.4)" : undefined,
                }}
              >
                {isCustomPhoto ? (
                  <img
                    src={avatar}
                    alt="User Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span className="profile-avatar-symbol">{avatar}</span>
                )}
              </div>
              <span className="profile-online-badge" />
            </div>

            <div className="profile-header-info">
              <div className="profile-badge-row">
                <span className="profile-role-tag">
                  <Award size={12} className="text-lime" /> TASTE PIONEER
                </span>
                <span className="profile-sync-badge">99.4% NEURAL SYNC</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <h2 className="profile-user-name" style={{ margin: 0 }}>{profileName}</h2>
                <button
                  type="button"
                  className="profile-device-photo-btn"
                  onClick={() => {
                    sound.playClick(600);
                    fileInputRef.current?.click();
                  }}
                  title="Upload avatar photo from your device"
                >
                  <Sparkles size={12} />
                  <span>Upload Photo from Device</span>
                </button>
              </div>
              <p className="profile-bio-text">
                Obsessive cinephile exploring intricate storylines, mind-bending puzzles, and visionary auteurs.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="stat-icon-wrap watched">
                <Film size={16} />
              </div>
              <strong className="stat-number">{watchedCount}</strong>
              <span className="stat-label">Watched</span>
            </div>

            <div className="profile-stat-box">
              <div className="stat-icon-wrap watchlist">
                <Bookmark size={16} />
              </div>
              <strong className="stat-number">{watchlistCount}</strong>
              <span className="stat-label">In Watchlist</span>
            </div>

            <div className="profile-stat-box">
              <div className="stat-icon-wrap ratings">
                <Star size={16} />
              </div>
              <strong className="stat-number">{ratingsCount}</strong>
              <span className="stat-label">Rated Masterpieces</span>
            </div>

            <div className="profile-stat-box">
              <div className="stat-icon-wrap vibe">
                <Zap size={16} />
              </div>
              <strong className="stat-number">98%</strong>
              <span className="stat-label">Canon Affinity</span>
            </div>
          </div>

          {/* Top Favorite Genres */}
          <div className="profile-section">
            <span className="profile-section-label">FAVORITE CURATION FREQUENCIES:</span>
            <div className="profile-genres-list">
              {topGenres.map((g) => (
                <span key={g} className="profile-genre-pill">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* 7D Taste DNA Profile */}
          <div className="profile-section">
            <div className="profile-section-header">
              <span className="profile-section-label">
                <Sparkles size={13} className="text-lime" /> YOUR 7D TASTE DNA SIGNATURE
              </span>
              <span className="dna-calibrated-tag">Calibrated to 9,700+ Films</span>
            </div>

            <div className="profile-dna-bars">
              {Object.entries(dna).slice(0, 5).map(([dim, val]) => (
                <div key={dim} className="profile-dna-row">
                  <span className="profile-dna-name">{dim}</span>
                  <div className="profile-dna-track">
                    <div
                      className="profile-dna-fill"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                  <span className="profile-dna-val">{val}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="profile-modal-footer">
            <button
              type="button"
              className="profile-share-btn"
              onClick={copyProfileLink}
            >
              {copied ? <Check size={16} className="text-lime" /> : <Share2 size={16} />}
              <span>{copied ? "Profile Link Copied!" : "Share Profile"}</span>
            </button>

            <Link
              href="/profile"
              className="profile-full-btn"
              onClick={() => {
                sound.playClick(600);
                onClose();
              }}
            >
              <User size={15} />
              <span>Full Profile & Account</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
