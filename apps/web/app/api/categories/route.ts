import { NextResponse } from "next/server";
import { getCategoriesList } from "@/lib/catalog-service";

export async function GET() {
  const items = getCategoriesList();
  return NextResponse.json({ items });
}
