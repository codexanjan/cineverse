import { NextRequest, NextResponse } from "next/server";
import { queryMoviesList } from "@/lib/catalog-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);
  const year_from = parseInt(searchParams.get("year_from") || "0", 10);
  const year_to = parseInt(searchParams.get("year_to") || "2100", 10);
  const max_runtime = parseInt(searchParams.get("max_runtime") || "0", 10);
  const min_score = parseFloat(searchParams.get("min_score") || "0");
  const sort = searchParams.get("sort") || "popular";

  const result = queryMoviesList({
    q,
    genre,
    offset,
    limit,
    year_from,
    year_to,
    max_runtime,
    min_score,
    sort,
  });

  return NextResponse.json(result);
}
