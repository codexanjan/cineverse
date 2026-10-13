import { NextRequest, NextResponse } from "next/server";
import { getCatalog, serializeMovie, MovieRecord } from "@/lib/catalog-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  const catalog = getCatalog();
  const movie = catalog.find((m: MovieRecord) => m.id === numId);

  if (!movie) {
    return NextResponse.json({ detail: "Movie not found" }, { status: 404 });
  }

  return NextResponse.json(serializeMovie(movie));
}
