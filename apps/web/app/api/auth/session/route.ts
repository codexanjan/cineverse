import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    user: {
      id: "demo-user",
      name: "Cinema Explorer",
      email: "explorer@cineverse.ai",
    },
    account: {
      id: "demo-user",
      name: "Cinema Explorer",
      email: "explorer@cineverse.ai",
    },
  });
}
