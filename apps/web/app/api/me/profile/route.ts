import { NextRequest, NextResponse } from "next/server";

let memoryProfile = {
  name: "Cinema Explorer",
  bio: "Curating feelings and hidden gems across 19 distinct film universes.",
  avatar: "star",
  genres: ["Sci-Fi", "Animation", "Drama"],
  hide_watched: false,
  email: "explorer@cineverse.ai",
  guest: false,
  local_account: true,
};

export async function GET() {
  return NextResponse.json(memoryProfile);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    memoryProfile = {
      ...memoryProfile,
      ...body,
    };
    return NextResponse.json(memoryProfile);
  } catch (e) {
    return NextResponse.json({ detail: "Failed to update profile" }, { status: 400 });
  }
}
