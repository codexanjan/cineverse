import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabase: false,
    local_accounts: true,
  });
}
