import { supabase } from "./auth";
let pending: Promise<string | null> | null = null;
async function demoToken() {
  const saved = localStorage.getItem("cineverse-demo");
  if (saved) return saved;
  if (!pending)
    pending = fetch("/api/session/demo", { method: "POST" })
      .then(async (r) => {
        if (!r.ok) return null;
        const { token } = await r.json();
        localStorage.setItem("cineverse-demo", token);
        return token;
      })
      .finally(() => {
        pending = null;
      });
  return pending;
}
export async function api(path: string, body?: unknown) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;
  if (session) headers.Authorization = `Bearer ${session.access_token}`;
  else {
    const token = await demoToken();
    if (token) headers["X-Demo-Token"] = token;
  }
  const request = () =>
    fetch("/api" + path, {
      method: body === undefined ? "GET" : "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      keepalive: body !== undefined,
      cache: "no-store",
    });
  let r: Response;
  // A stale proxy connection may reset once; only replay idempotent reads.
  try {
    r = await request();
  } catch (error) {
    if (body !== undefined) throw error;
    await new Promise((resolve) => setTimeout(resolve, 250));
    r = await request();
  }
  if (body === undefined && r.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    r = await request();
  }
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(
      typeof d.detail === "string"
        ? d.detail
        : `Could not complete your request (${r.status}).`,
    );
  }
  return r.json();
}
