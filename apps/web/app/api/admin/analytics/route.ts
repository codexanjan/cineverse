import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog-service";

export async function GET() {
  const catalog = getCatalog();
  return NextResponse.json({
    total_movies: catalog.length,
    total_curations: 19,
    neural_accuracy: "99.4%",
    active_frequency_streams: 6,
  });
}
