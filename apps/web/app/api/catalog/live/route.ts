import { NextRequest, NextResponse } from "next/server";
import { queryMoviesList } from "@/lib/catalog-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const result = queryMoviesList({ q, limit: 30 });
  return NextResponse.json(result);
}
