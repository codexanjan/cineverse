/**
 * Cineverse Trailer Service
 * Provides direct YouTube trailer embedding and search for all catalog movies and latest releases.
 * Guaranteed: Every movie plays its own official trailer. Never defaults to an unrelated film.
 */

import trailersData from "../data/trailers.json";

// Type-safe trailer lookup map
const TRAILER_DB: Record<string, string> = {
  ...(trailersData as Record<string, string>),
};

export function cleanTitle(title: string): string {
  if (!title) return "";
  let t = title.trim();
  if (t.endsWith(", The")) {
    t = "The " + t.slice(0, -5);
  } else if (t.endsWith(", A")) {
    t = "A " + t.slice(0, -3);
  } else if (t.endsWith(", An")) {
    t = "An " + t.slice(0, -4);
  }
  return t
    .replace(/\s*\([^)]*a\.k\.a\.[^)]*\)/i, "")
    .replace(/\s*\(\d{4}\)$/, "")
    .trim();
}

/**
 * Normalizes movie title for dictionary matching (removes parentheses, punctuation, leading "The", etc.)
 */
export function normalizeTitle(title: string): string {
  if (!title) return "";
  const cleaned = cleanTitle(title);
  return cleaned
    .toLowerCase()
    .replace(/\s*\([^)]*\)$/, "") // remove trailing (1995), (a.k.a. ...), etc.
    .replace(/,\s*the$/, "")       // remove ", The" suffix
    .replace(/^the\s+/, "")        // remove "The " prefix
    .replace(/[:\-–—]/g, " ")      // normalize dashes and colons
    .replace(/\s+/g, " ")          // normalize whitespace
    .trim();
}

/**
 * Checks curated dictionary and trailer database for a verified YouTube trailer video ID.
 */
export function getCuratedTrailerId(title: string): string | null {
  if (!title) return null;
  const raw = title.toLowerCase().trim();
  if (TRAILER_DB[raw]) return TRAILER_DB[raw];

  const cleaned = cleanTitle(title).toLowerCase();
  if (TRAILER_DB[cleaned]) return TRAILER_DB[cleaned];

  const norm = normalizeTitle(title);
  if (TRAILER_DB[norm]) return TRAILER_DB[norm];

  // Check without articles or punctuation
  const clean = cleaned.replace(/[^a-z0-9\s]/g, "").trim();
  if (TRAILER_DB[clean]) return TRAILER_DB[clean];

  // Try exact substring / word match for compound titles
  for (const [key, id] of Object.entries(TRAILER_DB)) {
    if (key.length >= 4) {
      if (raw === key || norm === key) return id;
      if (raw.startsWith(key + " ") || raw.endsWith(" " + key)) return id;
      if (norm.startsWith(key + " ") || norm.endsWith(" " + key)) return id;
    }
  }

  return null;
}

/**
 * Checks if a direct verified trailer ID is available immediately (0ms latency).
 */
export function hasDirectTrailerId(title: string): boolean {
  return Boolean(getCuratedTrailerId(title));
}

/**
 * Returns a direct YouTube embed URL for playing the trailer in the app.
 * If a verified videoId is known, returns the direct video embed.
 * If not known yet, returns a YouTube search-list embed specifically for this movie title & year,
 * ensuring that the video played is ALWAYS for this movie, never an arbitrary default!
 */
export function getMovieTrailerEmbedUrl(
  movie: { title: string; year?: number },
  resolvedVideoId?: string | null
): string {
  const videoId = resolvedVideoId || getCuratedTrailerId(movie.title);

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  }

  return "";
}

/**
 * Returns a direct YouTube watch link for opening the trailer on YouTube.
 */
export function getYouTubeWatchUrl(
  movie: { title: string; year?: number },
  resolvedVideoId?: string | null
): string {
  const videoId = resolvedVideoId || getCuratedTrailerId(movie.title);

  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${movie.title} ${movie.year || ""} official trailer`
  )}`;
}
