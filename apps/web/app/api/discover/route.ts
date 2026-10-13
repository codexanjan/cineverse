import { NextRequest, NextResponse } from "next/server";
import { discoverMoviesList } from "@/lib/catalog-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = discoverMoviesList({
      query: body.query,
      mood: body.mood,
      genre: body.genre,
      year_from: body.year_from,
      year_to: body.year_to,
      min_score: body.min_score,
      max_runtime: body.max_runtime,
      novelty: body.novelty,
      fusion: body.fusion,
      mode: body.mode,
      offset: Number(body.offset) || 0,
      limit: Math.min(Math.max(Number(body.limit) || 24, 1), 100),
      company: body.company,
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { detail: "Failed to discover movies" },
      { status: 500 }
    );
  }
}
