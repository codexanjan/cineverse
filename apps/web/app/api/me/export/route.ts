import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    items: [],
    profile: {
      name: "Cinema Explorer",
      exported_at: new Date().toISOString(),
    },
  });
}
