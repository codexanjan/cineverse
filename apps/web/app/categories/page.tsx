"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Poster } from "../../components/poster";
type Category = {
  name: string;
  count: number;
  poster: string | null;
  movie_id: number;
};
export default function Categories() {
  const [items, setItems] = useState<Category[]>([]),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(true);
  async function load() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/categories");
      if (!r.ok) throw new Error("The categories couldn’t load.");
      setItems((await r.json()).items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const visible = items.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="intro-page">
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
      <main className="categories-main" style={{ paddingTop: "40px" }}>
        <div className="eyebrow">PICK A WORLD. GET LOST IN IT.</div>
        <h1>
          So many stories.
          <br />
          <em>Where will you go?</em>
        </h1>
        <p>
          From quiet indies to galaxies far away. Find your next film by
          category.
        </p>
        <label className="category-search">
          <Search size={19} />
          <input
            aria-label="Search categories"
            placeholder="Find your genre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>{visible.length} worlds</span>
        </label>
        {busy && <p role="status">Opening the worlds of cinema…</p>}
        {error && (
          <div className="error" role="alert">
            {error}
            <button onClick={load}>Try again</button>
          </div>
        )}
        <div className="category-grid">
          {visible.map((c, i) => (
            <Link
              href={`/discover?genre=${encodeURIComponent(c.name)}`}
              key={c.name}
              className="category-tile"
            >
              <Poster path={c.poster} title="" movieId={c.movie_id} />
              <span className="category-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span>{c.count.toLocaleString()} films to discover</span>
                <h2>
                  {c.name}
                  <ArrowUpRight />
                </h2>
              </div>
            </Link>
          ))}
        </div>
        {!busy && !error && !visible.length && (
          <p>No categories match “{query}”. Try another genre.</p>
        )}
      </main>
      <footer className="intro-footer">
        <Link href="/" className="wordmark">
          CINEVERSE<span>AI</span>
        </Link>
        <p>Your next feeling is a film away.</p>
      </footer>
    </div>
  );
}
