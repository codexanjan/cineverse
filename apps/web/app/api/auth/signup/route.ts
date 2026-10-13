import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name || (body.email ? body.email.split("@")[0] : "Movie lover");
    const response = NextResponse.json({
      ok: true,
      account: {
        id: "local-user",
        name,
        email: body.email || "explorer@cineverse.ai",
      },
    });
    response.cookies.set("cineverse_session", "session-token-" + Date.now(), {
      path: "/",
      httpOnly: false,
    });
    return response;
  } catch (e) {
    return NextResponse.json({ ok: false, detail: "Sign up failed" }, { status: 400 });
  }
}
