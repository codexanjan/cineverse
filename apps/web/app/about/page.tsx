import Link from "next/link";
import { ArrowUpRight, Compass, Heart, Sparkles, Users } from "lucide-react";
export default function About() {
  return (
    <div className="profile-page">
      <header className="intro-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", height: "70px", padding: "0 6%" }}>
        <Link href="/" className="sidebar-brand" style={{ padding: 0, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <span className="brand-icon">
            C<span className="brand-dot" style={{ color: "var(--gold, #f5c518)" }}>✳</span>
          </span>
          <span className="brand-full-name" style={{ fontSize: "16px" }}>
            CINEVERSE<span className="brand-ai-badge" style={{ color: "var(--gold, #f5c518)", borderColor: "rgba(245, 197, 24, 0.3)", background: "rgba(245, 197, 24, 0.12)" }}>AI</span>
          </span>
        </Link>
        <Link
          href="/discover"
          className="landing-nav-btn highlight"
          style={{ fontWeight: 600, padding: "8px 20px", borderRadius: "999px", background: "rgba(245, 197, 24, 0.12)", border: "1px solid rgba(245, 197, 24, 0.3)", color: "#f5c518", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <span>Discover</span>
          <ArrowUpRight size={14} />
        </Link>
      </header>
      <main className="about-main" style={{ paddingTop: "40px" }}>
        <div className="eyebrow">
          A LITTLE LESS SCROLLING. A LOT MORE CINEMA.
        </div>
        <h1>
          How your next
          <br />
          <em>favorite finds you.</em>
        </h1>
        <p className="about-intro">
          Cineverse helps you discover movies. It recommends stories to watch;
          it doesn’t host or stream the films.
        </p>
        <div className="how-grid">
          {[
            [
              Compass,
              "01 / START ANYWHERE",
              "Browse by category, narrow by decade or runtime, or describe a feeling in your own words.",
            ],
            [
              Heart,
              "02 / MAKE IT PERSONAL",
              "Rate films, save favorites, and set preferred genres in your profile. These signals shape your next recommendations.",
            ],
            [
              Sparkles,
              "03 / FOLLOW YOUR CURIOSITY",
              "Try a mystery pick, discover hidden gems, or fuse the qualities of two favorite movies in Taste Lab.",
            ],
            [
              Users,
              "04 / MAKE IT A MOVIE NIGHT",
              "Add favorites for each person in Group Night. We look for films that balance everyone’s tastes.",
            ],
          ].map(([Icon, title, body]: any) => (
            <section className="profile-panel" key={title}>
              <Icon size={25} />
              <div className="eyebrow">{title}</div>
              <p>{body}</p>
            </section>
          ))}
        </div>
        <section className="profile-panel explanation">
          <h2>What goes into a recommendation?</h2>
          <p>
            We combine your ratings and favorite genres with community ratings,
            similarities between movie descriptions, and patterns learned from
            MovieLens ratings. Mood and novelty controls adjust the mix. The
            reasons on each result explain which signals contributed.
          </p>
          <p>
            Your preferred genres give new recommendations a starting point.
            “Not for me” removes a film from future recommendations, and your
            profile can exclude films you’ve already watched. Browse remains
            open to the complete catalog.
          </p>
          <h3>What’s real, and what needs a connection?</h3>
          <p>
            The included catalog has 9,742 movies, real MovieLens ratings, and
            enriched movie metadata. A collaborative model is trained on 100,836
            ratings; the lightweight semantic model learns from titles, genres
            and plots. Movie DNA describes genre patterns, not an analysis of
            every scene.
          </p>
          <p>
            Local accounts and recommendations work without paid services.
            Poster images need internet access. Current TMDB search requires a
            TMDB token; Supabase accounts require configuration. Those services
            show clear fallback or unavailable states when disconnected.
          </p>
          <Link href="/discover" className="intro-cta">
            Find my next obsession <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
    </div>
  );
}
