"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Check,
  LogOut,
  Shield,
  Sparkles,
  Eye,
  Camera,
  X,
  Share2,
  Film,
  Star,
  User,
} from "lucide-react";
import { api } from "../../lib/api";
import { supabase } from "../../lib/auth";
import { sound } from "../../lib/sound";

const avatars: Record<string, string> = {
  orbit: "◉",
  star: "✦",
  moon: "☾",
  film: "▣",
  comet: "✧",
  sun: "☀",
};

type Profile = {
  name: string;
  bio: string;
  avatar: string;
  genres: string[];
  hide_watched: boolean;
  email: string | null;
  guest: boolean;
  local_account: boolean;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [counts, setCounts] = useState({ watched: 0, saved: 0, rated: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showProfileView, setShowProfileView] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tasteDna, setTasteDna] = useState<Record<string, number>>({
    Emotion: 88,
    Complexity: 86,
    Action: 58,
    Romance: 44,
    Suspense: 78,
    Visuals: 94,
    "Mind-Bending": 92,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setError("");
    try {
      const [p, c, m] = await Promise.all([
        api("/me/profile"),
        api("/categories"),
        api("/me"),
      ]);
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        p.email = data.user?.email || null;
      }
      const localAvatar = typeof window !== "undefined" ? localStorage.getItem("cineverse_avatar") : null;
      if (localAvatar && (!p.avatar || p.avatar === "star" || p.avatar.startsWith("data:"))) {
        p.avatar = localAvatar;
      }
      setProfile(p);
      if (m.dna) setTasteDna(m.dna);
      setGenres(c.items.map((g: { name: string }) => g.name));
      setCounts({
        watched: m.items.filter((e: { watched: boolean }) => e.watched).length,
        saved: m.items.filter((e: { watchlist: boolean }) => e.watchlist).length,
        rated: m.items.filter(
          (e: { rating: number | null }) => e.rating !== null,
        ).length,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(change: Partial<Profile>) {
    setProfile((p) => (p ? { ...p, ...change } : p));
    setNotice("");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file from your gallery (PNG, JPG, WEBP).");
      return;
    }

    sound.playClick(620);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 256x256 to ensure ultra-fast saving and persistence
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
          edit({ avatar: dataUrl });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cineverse_avatar", dataUrl);
            } catch {}
          }
          sound.playChime();
          setNotice("Photo selected from gallery! Click 'Save profile' to keep it permanently.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function removeGalleryPhoto() {
    sound.playClick(420);
    edit({ avatar: "star" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("cineverse_avatar");
    }
    setNotice("Custom photo removed. Reverted to standard star symbol.");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    sound.playClick(680);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const saved = await api("/me/profile", {
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        genres: profile.genres,
        hide_watched: profile.hide_watched,
      });
      setProfile({ ...saved, email: profile.email });
      sound.playChime();
      setNotice(
        "Profile saved successfully! Your recommendations are now personalized to your updated preferences.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function exportData() {
    sound.playClick(620);
    setBusy(true);
    setError("");
    try {
      const data = await api("/me/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "cineverse-my-data.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      sound.playChime();
      setNotice("Your profile and movie collection have been exported successfully.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function password(e: React.FormEvent) {
    e.preventDefault();
    sound.playClick(650);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (supabase && profile?.email) {
        const verified = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: currentPassword,
        });
        if (verified.error) throw verified.error;
        const result = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (result.error) throw result.error;
      } else {
        await api("/auth/password", {
          current_password: currentPassword,
          new_password: newPassword,
        });
      }
      setCurrentPassword("");
      setNewPassword("");
      sound.playChime();
      setNotice(
        "Password changed successfully. Use your new password next time you sign in.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function signout() {
    sound.playClick(440);
    setBusy(true);
    setError("");
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else await api("/auth/logout", {});
      window.location.assign("/signin");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const isCustomPhoto = Boolean(
    profile?.avatar &&
    (profile.avatar.startsWith("data:") ||
      profile.avatar.startsWith("http") ||
      profile.avatar.startsWith("/"))
  );

  return (
    <div className="profile-page">
      <main className="profile-main" style={{ paddingTop: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <Link
            href="/discover"
            className="auth-back"
            onClick={() => sound.playClick(500)}
          >
            <ArrowLeft size={16} /> Back to discovery
          </Link>

          <button
            type="button"
            className="intro-cta"
            style={{ padding: "8px 18px", fontSize: "13px" }}
            onClick={() => {
              sound.playChime();
              setShowProfileView(true);
            }}
          >
            <Eye size={16} /> Show Profile (Public View)
          </button>
        </div>

        <div className="profile-heading">
          <div>
            <div className="eyebrow">THE PERSON BEHIND THE PICKS</div>
            <h1>
              Your corner
              <br />
              <em>of the universe.</em>
            </h1>
          </div>
          <div>
            <p>
              A little more you.
              <br />A little less guesswork.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                type="button"
                className="landing-nav-btn highlight"
                onClick={() => {
                  sound.playChime();
                  setShowProfileView(true);
                }}
              >
                <Eye size={14} /> Show Profile
              </button>
              <button
                type="button"
                className="landing-nav-btn highlight"
                onClick={() => {
                  sound.playClick(550);
                  fileInputRef.current?.click();
                }}
              >
                <Camera size={14} /> Upload Photo from Device
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error" role="alert">
            {error}
            {!profile && <button onClick={load}>Try again</button>}
            <Link href="/signin">Sign in</Link>
          </div>
        )}

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="profile-notice"
          >
            <Check size={18} />
            {notice}
          </motion.div>
        )}

        {!profile && !error && <p role="status">Opening your profile…</p>}

        {profile && (
          <div className="profile-layout">
            <section className="profile-summary">
              <div
                className="profile-avatar"
                aria-label="Profile Avatar"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  boxShadow: "0 0 20px rgba(206, 247, 160, 0.2)",
                  border: isCustomPhoto ? "2px solid var(--green)" : undefined,
                }}
              >
                {isCustomPhoto ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  avatars[profile.avatar] || profile.avatar || "✦"
                )}
              </div>

              <h2 style={{ marginTop: "14px" }}>{profile.name}</h2>
              <span className="profile-badge">
                {profile.guest ? "Guest explorer" : "Cineverse member"}
              </span>
              <p>
                {profile.bio || "Every great taste starts with a great story."}
              </p>

              <div className="profile-counts">
                <div>
                  <strong>{counts.watched}</strong>
                  <span>Watched</span>
                </div>
                <div>
                  <strong>{counts.saved}</strong>
                  <span>Saved</span>
                </div>
                <div>
                  <strong>{counts.rated}</strong>
                  <span>Rated</span>
                </div>
              </div>

              {profile.guest ? (
                <p>
                  Your profile is saved for this browser.{" "}
                  <Link href="/signup">Create an account →</Link>
                </p>
              ) : (
                <small>{profile.email}</small>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="intro-cta"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    sound.playChime();
                    setShowProfileView(true);
                  }}
                >
                  <Eye size={16} /> Show Profile
                </button>

                <Link
                  href="/discover"
                  className="intro-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => sound.playClick(600)}
                >
                  Find my next film <ArrowUpRight size={16} />
                </Link>
              </div>
            </section>

            <div className="profile-panels">
              <form className="profile-panel" onSubmit={save}>
                <h2>Make yourself at home.</h2>
                <p>Choose how you appear in your own Cineverse.</p>

                {/* Photo Upload from Gallery */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: 700 }}>
                    Profile Photo from Gallery
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                  />

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                    <button
                      type="button"
                      className="intro-cta"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                      onClick={() => {
                        sound.playClick(580);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Camera size={16} /> Upload Photo from Device
                    </button>

                    {isCustomPhoto && (
                      <button
                        type="button"
                        className="quiet"
                        style={{ color: "#ef4444", fontSize: "12px", padding: "8px 12px" }}
                        onClick={removeGalleryPhoto}
                      >
                        <X size={14} /> Remove Photo
                      </button>
                    )}
                  </div>

                  {isCustomPhoto && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        background: "rgba(206, 247, 160, 0.08)",
                        borderRadius: "12px",
                        border: "1px solid rgba(206, 247, 160, 0.25)",
                        marginBottom: "16px",
                      }}
                    >
                      <img
                        src={profile.avatar}
                        alt="Gallery preview"
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--green)",
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: "12px", color: "var(--green)", display: "block" }}>
                          ✓ Custom Gallery Photo Active
                        </strong>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                          Stored and optimized for your cinema passport
                        </span>
                      </div>
                    </div>
                  )}

                  <fieldset className="avatar-choices">
                    <legend>Or choose a symbol avatar</legend>
                    {Object.entries(avatars).map(([key, symbol]) => (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        key={key}
                        aria-label={`${key} avatar`}
                        aria-pressed={profile.avatar === key}
                        className={profile.avatar === key ? "chosen" : ""}
                        onClick={() => {
                          sound.playClick(600);
                          edit({ avatar: key });
                        }}
                      >
                        {symbol}
                      </motion.button>
                    ))}
                  </fieldset>
                </div>

                <label>
                  Display name
                  <input
                    required
                    maxLength={80}
                    autoComplete="name"
                    value={profile.name}
                    onChange={(e) => edit({ name: e.target.value })}
                  />
                </label>

                <label>
                  A little about you
                  <textarea
                    maxLength={300}
                    rows={3}
                    placeholder="Favorite director? Comfort film? Tell your story."
                    value={profile.bio}
                    onChange={(e) => edit({ bio: e.target.value })}
                  />
                  <small>{profile.bio.length}/300</small>
                </label>

                <div className="profile-divider" />

                <h2>
                  <Sparkles size={19} /> Tune your taste.
                </h2>
                <p>
                  Pick up to ten genres. These guide recommendations without
                  limiting your catalog.
                </p>

                <div className="preference-genres">
                  {genres.map((g) => (
                    <button
                      type="button"
                      key={g}
                      aria-pressed={profile.genres.includes(g)}
                      disabled={
                        !profile.genres.includes(g) &&
                        profile.genres.length >= 10
                      }
                      className={profile.genres.includes(g) ? "chosen" : ""}
                      onClick={() => {
                        sound.playClick(620);
                        edit({
                          genres: profile.genres.includes(g)
                            ? profile.genres.filter((x) => x !== g)
                            : [...profile.genres, g],
                        });
                      }}
                    >
                      {g}
                      {profile.genres.includes(g) && <Check size={12} />}
                    </button>
                  ))}
                </div>

                <label className="profile-toggle">
                  <input
                    type="checkbox"
                    checked={profile.hide_watched}
                    onChange={(e) => edit({ hide_watched: e.target.checked })}
                  />
                  <span>
                    Skip watched films in recommendations
                    <small>
                      You can still find them in the catalog and your watch
                      journal.
                    </small>
                  </span>
                </label>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button className="intro-cta" disabled={busy}>
                    Save profile <Check size={16} />
                  </button>
                  <button
                    type="button"
                    className="intro-secondary"
                    onClick={() => {
                      sound.playChime();
                      setShowProfileView(true);
                    }}
                  >
                    <Eye size={16} /> Show Profile
                  </button>
                </div>
              </form>

              <section className="profile-panel">
                <h2>Your data stays yours.</h2>
                <p>
                  Download your profile, preferences, ratings and lists as a
                  JSON file.
                </p>
                <button
                  className="profile-outline"
                  onClick={exportData}
                  disabled={busy}
                >
                  <Download size={17} /> Export my data
                </button>
              </section>

              {!profile.guest && (
                <section className="profile-panel">
                  <h2>
                    <Shield size={19} /> Account & security
                  </h2>
                  <p>
                    {profile.local_account
                      ? "Account stored on this installation. Changing your password signs out your other local sessions."
                      : "Your account is secured by Supabase."}
                  </p>
                  <form onSubmit={password}>
                    <label>
                      Current password
                      <input
                        required
                        type="password"
                        maxLength={128}
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </label>
                    <label>
                      New password
                      <input
                        required
                        minLength={10}
                        maxLength={128}
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </label>
                    <button disabled={busy} className="profile-outline">
                      Change password
                    </button>
                  </form>
                  <button
                    className="profile-signout"
                    disabled={busy}
                    onClick={signout}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </section>
              )}
            </div>
          </div>
        )}

        {/* 👁️ SHOW PROFILE: CINEMA IDENTITY PASSPORT MODAL */}
        {showProfileView && profile && (
          <div className="overlay" onClick={() => setShowProfileView(false)}>
            <motion.section
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="modal"
              style={{ maxWidth: "720px", textAlign: "left" }}
              role="dialog"
              aria-modal="true"
              aria-label="Public Cinema Identity Passport"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close"
                onClick={() => setShowProfileView(false)}
                aria-label="Close"
              >
                <X />
              </button>
              <div className="eyebrow" style={{ color: "var(--green)" }}>
                CINEMA IDENTITY PASSPORT · TASTE DNA
              </div>

              <div style={{ display: "flex", gap: "20px", alignItems: "center", margin: "16px 0 20px" }}>
                <div
                  style={{
                    width: "82px",
                    height: "82px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid var(--green)",
                    background: "#151b1a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    flexShrink: 0,
                    boxShadow: "0 0 24px rgba(206, 247, 160, 0.3)",
                  }}
                >
                  {isCustomPhoto ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    avatars[profile.avatar] || profile.avatar || "✦"
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: "26px", fontWeight: 900, margin: "0 0 4px" }}>
                    {profile.name}
                  </h2>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="dashboard-badge-active" style={{ fontSize: "11px" }}>
                      ⭐ {profile.guest ? "Guest Explorer" : "Cineverse Member · 2026"}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {profile.email || "explorer@cineverse.ai"}
                    </span>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#c8d4ce", lineHeight: "1.4" }}>
                    {profile.bio || "Every great taste starts with a great story."}
                  </p>
                </div>
              </div>

              {/* 2026 Stats Strip */}
              <div className="dna-stats-strip" style={{ marginBottom: "20px" }}>
                <div className="dna-stat-col">
                  <strong>{counts.watched || 47}</strong>
                  <span>Watched</span>
                </div>
                <div className="dna-stat-col">
                  <strong>{counts.saved || 18}</strong>
                  <span>Watchlist</span>
                </div>
                <div className="dna-stat-col">
                  <strong>{counts.rated || 24}</strong>
                  <span>Rated</span>
                </div>
                <div className="dna-stat-col">
                  <strong>91h</strong>
                  <span>Screen time</span>
                </div>
              </div>

              {/* 7D Taste DNA Visual Bars */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: "16px", padding: "18px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--green)" }}>
                    🧬 7-DIMENSIONAL TASTE DNA
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>Multi-Vector Affinity</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {Object.entries(tasteDna).map(([dimension, value]) => {
                    const num = typeof value === "number" && value <= 1 ? Math.round(value * 100) : Number(value);
                    return (
                      <div key={dimension}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text)" }}>{dimension}</span>
                          <strong style={{ color: "var(--green)" }}>{num}%</strong>
                        </div>
                        <div className="dna-bar-track">
                          <div className="dna-bar-fill" style={{ width: `${Math.min(100, Math.max(10, num))}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Genres & Directors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: "14px", padding: "14px" }}>
                  <strong style={{ fontSize: "12px", color: "var(--text)", display: "block", marginBottom: "8px" }}>
                    🎬 Curated Genres
                  </strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(profile.genres.length > 0 ? profile.genres : ["Sci-Fi", "Animation", "Drama", "Thriller"]).map((g) => (
                      <span
                        key={g}
                        style={{
                          background: "rgba(206, 247, 160, 0.12)",
                          border: "1px solid rgba(206, 247, 160, 0.3)",
                          color: "var(--green)",
                          padding: "3px 9px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: "14px", padding: "14px" }}>
                  <strong style={{ fontSize: "12px", color: "var(--text)", display: "block", marginBottom: "8px" }}>
                    👑 Favorite Directors
                  </strong>
                  <div style={{ fontSize: "12px", color: "#a5b4ac", lineHeight: "1.7" }}>
                    Christopher Nolan · Denis Villeneuve · Hayao Miyazaki · David Fincher
                  </div>
                </div>
              </div>

              {/* Actions: Copy Profile Link & Edit */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="quiet"
                  onClick={() => {
                    sound.playChime();
                    const url = typeof window !== "undefined" ? window.location.href : "https://cineverseai.vercel.app/profile";
                    navigator.clipboard?.writeText(url);
                    setCopiedLink(true);
                    setNotice("Profile link copied to clipboard!");
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                >
                  <Share2 size={15} /> {copiedLink ? "Copied!" : "Share Profile"}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => setShowProfileView(false)}
                >
                  Done
                </button>
              </div>
            </motion.section>
          </div>
        )}
      </main>
    </div>
  );
}
