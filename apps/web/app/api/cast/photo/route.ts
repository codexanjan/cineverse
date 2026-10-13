import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const photoCache = new Map<string, string>();
let staticActorsMap: Record<string, string> | null = null;

function getStaticActors(): Record<string, string> {
  if (staticActorsMap) return staticActorsMap;
  try {
    const p = path.resolve(process.cwd(), "apps/web/data/actors.json");
    if (fs.existsSync(p)) {
      staticActorsMap = JSON.parse(fs.readFileSync(p, "utf-8"));
      return staticActorsMap || {};
    }
  } catch {}
  return {};
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();
  const format = searchParams.get("format");

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const norm = name.toLowerCase().trim();

  const respondWithPhoto = (photoUrl: string) => {
    if (format === "json" || req.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({ photo: photoUrl });
    }
    return NextResponse.redirect(photoUrl, 307);
  };

  // 1. Check memory cache
  if (photoCache.has(norm)) {
    return respondWithPhoto(photoCache.get(norm)!);
  }

  // 2. Check static database
  const map = getStaticActors();
  if (map[norm]) {
    photoCache.set(norm, map[norm]);
    return respondWithPhoto(map[norm]);
  }

  // Check partial name match
  for (const [key, url] of Object.entries(map)) {
    if (key.includes(norm) || norm.includes(key)) {
      photoCache.set(norm, url);
      return respondWithPhoto(url);
    }
  }

  // 3. Dynamic lookup via Wikipedia Rest API
  try {
    const wikiUrl =
      "https://en.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(name.replace(/ /g, "_"));
    const res = await fetch(wikiUrl, {
      headers: {
        "User-Agent": "Cineverse/1.0 (https://cineverseai.vercel.app)",
      },
      next: { revalidate: 86400 * 30 }, // Cache 30 days
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.thumbnail?.source) {
        const photo = data.thumbnail.source;
        photoCache.set(norm, photo);
        return respondWithPhoto(photo);
      }
    }
  } catch (err) {
    console.error("Actor photo lookup error for", name, err);
  }

  // 4. Clean cinema fallback
  const fallback = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`;
  return respondWithPhoto(fallback);
}
