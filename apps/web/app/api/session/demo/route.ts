import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  const token = crypto.randomBytes(32).toString("hex");
  return NextResponse.json({ token });
}
