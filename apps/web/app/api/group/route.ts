import { NextRequest, NextResponse } from "next/server";
import { getCatalog, serializeMovie } from "@/lib/catalog-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const favorites: number[][] = body.favorites || [];
    const vibe: string = body.vibe || "crowd_pleaser"; // crowd_pleaser, thrills, deep, comedy, wildcard
    const personNames: string[] = body.personNames || [];
    const catalog = getCatalog();

    // If no favorites are selected, return top rated crowd pleasers
    if (!favorites.length || !favorites.some((f) => f.length > 0)) {
      const popular = catalog
        .filter((m) => m.score >= 3.8 && m.votes >= 50)
        .slice(0, 16)
        .map((m) =>
          serializeMovie(m, 98.5, ["Universal crowd pleaser for group night"])
        );
      return NextResponse.json({ items: popular });
    }

    // Map each person's selected movies and their genres
    const personProfiles = favorites.map((ids, idx) => {
      const idSet = new Set(ids);
      const userMovies = catalog.filter((m) => idSet.has(m.id));
      const genreSet = new Set<string>();
      for (const m of userMovies) {
        for (const g of m.genres) {
          if (g && g !== "(no genres listed)") genreSet.add(g);
        }
      }
      return {
        name: personNames[idx] || `Person ${idx + 1}`,
        movies: userMovies,
        genres: genreSet,
      };
    });

    const activePersons = personProfiles.filter((p) => p.genres.size > 0);
    const allSelectedIds = new Set(favorites.flat());

    const scored = catalog
      .filter((m) => !allSelectedIds.has(m.id))
      .map((m) => {
        let satisfiedPersons = 0;
        const matchedPersonNames: string[] = [];

        for (const p of activePersons) {
          const sharesGenre = m.genres.some((g) => p.genres.has(g));
          if (sharesGenre) {
            satisfiedPersons++;
            matchedPersonNames.push(p.name);
          }
        }

        const personMatchRatio =
          activePersons.length > 0 ? satisfiedPersons / activePersons.length : 1;
        let vibeBonus = 0;

        if (vibe === "thrills") {
          if (
            m.genres.some((g) =>
              ["Action", "Thriller", "Sci-Fi", "Mystery"].includes(g),
            )
          )
            vibeBonus += 0.3;
        } else if (vibe === "deep") {
          if (
            m.genres.some((g) => ["Drama", "Crime", "Mystery"].includes(g)) &&
            m.score >= 4.0
          )
            vibeBonus += 0.35;
        } else if (vibe === "comedy") {
          if (
            m.genres.some((g) =>
              ["Comedy", "Animation", "Romance"].includes(g),
            )
          )
            vibeBonus += 0.35;
        } else if (vibe === "wildcard") {
          if (m.votes >= 10 && m.votes <= 100 && m.score >= 3.7)
            vibeBonus += 0.4;
        } else {
          // crowd_pleaser
          if (m.score >= 4.0 && m.votes >= 50) vibeBonus += 0.35;
        }

        const consensusScore =
          personMatchRatio * 0.6 + (m.score / 5) * 0.25 + vibeBonus;
        const matchPercent = Math.min(
          99.8,
          Math.round((0.8 + personMatchRatio * 0.15 + m.score / 25) * 1000) /
            10,
        );

        const reasons: string[] = [];
        if (
          satisfiedPersons === activePersons.length &&
          activePersons.length > 1
        ) {
          reasons.push(
            `✦ 100% Group Consensus: Matches everyone's taste profile!`,
          );
        } else if (matchedPersonNames.length > 0) {
          reasons.push(
            `✦ ${matchPercent}% Group Match · Loved by ${matchedPersonNames.slice(0, 3).join(", ")}`,
          );
        } else {
          reasons.push(
            `✦ ${matchPercent}% Consensus: Balanced compromise for the group`,
          );
        }

        return {
          movie: m,
          score: consensusScore,
          match: matchPercent,
          reasons,
        };
      });

    scored.sort(
      (a, b) => b.score - a.score || b.movie.score - a.movie.score,
    );

    const items = scored
      .slice(0, 18)
      .map((r) => serializeMovie(r.movie, r.match, r.reasons));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

