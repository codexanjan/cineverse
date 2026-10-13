import { NextRequest, NextResponse } from "next/server";
import { getCuratedTrailerId, normalizeTitle, cleanTitle } from "@/lib/trailer";

// Server memory cache for ultra-fast trailer resolution across requests
const trailerCache = new Map<string, string>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title")?.trim();
  const year = searchParams.get("year")?.trim() || "";

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const cleaned = cleanTitle(title) || title;
  const cacheKey = `${cleaned.toLowerCase()}_${year}`;

  // 1. Check server memory cache
  if (trailerCache.has(cacheKey)) {
    const videoId = trailerCache.get(cacheKey)!;
    return NextResponse.json({
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      source: "cache",
    });
  }

  // 2. Check curated and pre-loaded trailer database
  const curatedId = getCuratedTrailerId(title) || getCuratedTrailerId(cleaned);
  if (curatedId) {
    trailerCache.set(cacheKey, curatedId);
    return NextResponse.json({
      videoId: curatedId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${curatedId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
      watchUrl: `https://www.youtube.com/watch?v=${curatedId}`,
      source: "database",
    });
  }

  // 3. Query YouTube search to discover exact official trailer video ID for this specific movie
  try {
    const query = `${cleaned} ${year} official trailer`.trim();
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(ytUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 86400 * 7 }, // Cache for 7 days
    });

    if (res.ok) {
      const html = await res.text();

      // Match first videoId inside primary videoRenderer (exact first search result)
      const videoRendererMatch = html.match(
        /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/
      );
      const anyVideoMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

      const videoId = videoRendererMatch?.[1] || anyVideoMatch?.[1];

      if (videoId) {
        trailerCache.set(cacheKey, videoId);
        return NextResponse.json({
          videoId,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
          source: "search",
        });
      }
    }
  } catch (err) {
    console.error("Trailer resolution error for", title, err);
  }

  // 4. Guaranteed fallback for when YouTube search returns no direct embed
  const fallbackQuery = `${cleaned} ${year} official trailer`.trim();
  const directWatchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(fallbackQuery)}`;

  return NextResponse.json({
    videoId: null,
    embedUrl: "",
    watchUrl: directWatchUrl,
    source: "search-fallback",
  });
}
