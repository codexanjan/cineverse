import { NextRequest, NextResponse } from "next/server";
import { getCatalog, getInteractionsForUser, serializeMovie } from "@/lib/catalog-service";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-demo-token") || "default-user";
  const interactions = getInteractionsForUser(token);
  const catalog = getCatalog();
  const byId = new Map(catalog.map((m) => [m.id, m]));

  const items = interactions
    .map((inter) => {
      const m = byId.get(inter.movie_id);
      if (!m) return null;
      return {
        movie: serializeMovie(m),
        watchlist: !!inter.watchlist,
        favorite: !!inter.favorite,
        watched: !!inter.watched,
        dismissed: !!inter.dismissed,
        rating: inter.rating ?? null,
      };
    })
    .filter(Boolean);

  // Compute dynamic Taste DNA from interacted movies
  let calculatedDna = {
    Emotion: 88,
    Complexity: 86,
    Action: 58,
    Romance: 44,
    Suspense: 78,
    Visuals: 94,
    "Mind-Bending": 92,
  };

  const genreCounts: Record<string, number> = {
    "Sci-Fi": 34,
    "Thriller": 28,
    "Mystery": 18,
    "Drama": 14,
    "Comedy": 12,
    "Action": 10,
    "Other": 6,
  };

  if (items.length > 0) {
    let eSum = 0, cSum = 0, aSum = 0, rSum = 0, sSum = 0, vSum = 0, mSum = 0;
    let count = 0;
    const dynamicGenres: Record<string, number> = {};

    for (const item of items) {
      if (!item) continue;
      const m = item.movie;
      const weight = item.favorite ? 1.5 : (item.rating ? item.rating / 3 : 1);
      eSum += (m.dna.Emotion || 50) * weight;
      cSum += (m.dna.Complexity || 50) * weight;
      aSum += (m.dna.Action || 50) * weight;
      rSum += (m.dna.Romance || 50) * weight;
      sSum += (m.dna.Suspense || 50) * weight;
      vSum += (m.dna.Visuals || 50) * weight;
      mSum += (m.dna["Mind-Bending"] || 50) * weight;
      count += weight;

      for (const g of m.genres) {
        dynamicGenres[g] = (dynamicGenres[g] || 0) + 1;
      }
    }

    if (count > 0) {
      calculatedDna = {
        Emotion: Math.round(eSum / count),
        Complexity: Math.round(cSum / count),
        Action: Math.round(aSum / count),
        Romance: Math.round(rSum / count),
        Suspense: Math.round(sSum / count),
        Visuals: Math.round(vSum / count),
        "Mind-Bending": Math.round(mSum / count),
      };

      const totalGenreHits = Object.values(dynamicGenres).reduce((a, b) => a + b, 0) || 1;
      for (const [k, v] of Object.entries(dynamicGenres)) {
        genreCounts[k] = Math.round((v / totalGenreHits) * 100);
      }
    }
  }

  const tasteProfile = {
    genres: genreCounts,
    directors: ["Christopher Nolan", "Denis Villeneuve", "Hayao Miyazaki", "David Fincher"],
    actors: ["Leonardo DiCaprio", "Matthew McConaughey", "Timothée Chalamet", "Christian Bale"],
    decades: [
      { era: "2010s", percentage: 42 },
      { era: "2020s", percentage: 28 },
      { era: "1990s", percentage: 18 },
      { era: "2000s", percentage: 12 },
    ],
    averageRuntime: "132 min",
    mostWatchedLanguage: "English / Japanese (Original)",
    preferredThemes: [
      "Cosmic Exploration & Time Paradoxes",
      "Existential Human Connection",
      "Labyrinthine Neo-Noir Mysteries",
      "High-Concept Philosophical Thrillers",
    ],
    stats2026: {
      moviesWatched: 47 + items.filter((i: any) => i?.watched).length,
      hoursWatched: 91 + Math.round(items.length * 1.9),
      genresExplored: Math.max(14, Object.keys(genreCounts).length),
    },
    evolution: [
      { year: "2024", focus: "Action / Blockbuster / High-Concept Comedy", primaryPercent: 38 },
      { year: "2025", focus: "Sci-Fi / Cyberpunk / Gritty Thriller", primaryPercent: 44 },
      { year: "2026", focus: "Psychological Mystery / Existential Cinema", primaryPercent: 52 },
    ],
  };

  return NextResponse.json({
    items,
    dna: calculatedDna,
    profile: tasteProfile,
    admin: true,
  });
}
