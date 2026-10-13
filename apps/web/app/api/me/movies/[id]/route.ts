import { NextRequest, NextResponse } from "next/server";
import { saveInteractionForUser } from "@/lib/catalog-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  const token = req.headers.get("x-demo-token") || "default-user";

  try {
    const body = await req.json().catch(() => ({}));
    saveInteractionForUser(token, numId, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ detail: "Failed to update interaction" }, { status: 400 });
  }
}
