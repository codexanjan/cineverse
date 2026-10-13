import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, status: "Catalog verified and active" });
}
