"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { supabase } from "../../lib/auth";
import { Poster } from "../../components/poster";
export default function Login({ initialSignup = false }: { initialSignup?: boolean } = {}) {
  const [signup, setSignup] = useState(initialSignup),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [local, setLocal] = useState(false);
  useEffect(() => {
    const isSignup =
      initialSignup ||
      (typeof window !== "undefined" &&
        (window.location.pathname.includes("signup") ||
          new URLSearchParams(window.location.search).get("mode") === "signup"));
    setSignup(Boolean(isSignup));
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((d) => setLocal(d.local_accounts))
      .catch(() => setError("Unable to reach sign-in. Please try again."));
  }, [initialSignup]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (supabase) {
        const result = signup
          ? await supabase.auth.signUp({
              email,
              password,
              options: { data: { display_name: name } },
            })
          : await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        if (!result.data.session) {
          setMessage(
            "Check your inbox to confirm your email, then come back to sign in.",
          );
          return;
        }
      } else {
        const response = await fetch(
          `/api/auth/${signup ? "signup" : "login"}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              name: name || "Movie lover",
            }),
          },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            typeof result.detail === "string"
              ? result.detail
              : "Please check your details and try again.",
          );
      }
      window.location.assign("/discover");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link href="/" className="wordmark">
          CINEVERSE<span>✳ AI</span>
        </Link>
        <div className="auth-poster-wall">
          {[
            "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
            "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
            "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
          ].map((path) => (
            <div key={path}>
              <Poster path={path} title="" />
            </div>
          ))}
        </div>
        <div className="auth-story-copy">
          <div className="eyebrow">
            <Sparkles size={14} /> YOUR TASTE. YOUR STORIES.
          </div>
          <h1>
            A world of cinema.
            <br />
            <em>A universe of you.</em>
          </h1>
          <p>
            Great films stay with you.
            <br />
            Keep them all in one place.
          </p>
        </div>
      </section>
      <main className="auth-form-side">
        <Link href="/" className="auth-back">
          <ArrowLeft size={16} /> Back to the universe
        </Link>
        <div className="auth-form-inner">
          <div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
          <h2>{signup ? "Make it yours." : "Welcome back."}</h2>
          <p>
            {signup
              ? "Create a home for your cinematic obsessions."
              : "Your watchlist missed you. Let’s find your next favorite."}
          </p>
          <div className="auth-tabs">
            <button
              className={!signup ? "selected" : ""}
              onClick={() => {
                setSignup(false);
                setError("");
                setMessage("");
              }}
            >
              Sign in
            </button>
            <button
              className={signup ? "selected" : ""}
              onClick={() => {
                setSignup(true);
                setError("");
                setMessage("");
              }}
            >
              Create account
            </button>
          </div>
          <form onSubmit={submit}>
            {signup && (
              <label>
                Your name
                <input
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                />
              </label>
            )}
            <label>
              Email address
              <input
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  required
                  minLength={signup ? 10 : 1}
                  maxLength={128}
                  type={show ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    signup ? "At least 10 characters" : "Your password"
                  }
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <div role="alert" className="error">
                {error}
              </div>
            )}
            {message && (
              <div role="status" className="notice">
                {message}
              </div>
            )}
            <button
              className="intro-cta auth-submit"
              disabled={busy || (!supabase && !local)}
            >
              {busy
                ? "Opening your universe…"
                : signup
                  ? "Create my account"
                  : "Let me in"}
              <ArrowUpRight size={19} />
            </button>
          </form>
          <p className="auth-footnote">
            {local
              ? "Your account is saved on this installation. Email verification and password recovery are not enabled in local mode."
              : "Secure sign-in powered by Supabase."}
          </p>
          <div className="auth-divider">
            <span />
            JUST LOOKING AROUND?
            <span />
          </div>
          <Link href="/discover" className="guest-link">
            Explore as a guest <ArrowUpRight size={16} />
          </Link>
          <small className="guest-note">
            Guest lists stay with this browser. New accounts start with a fresh
            collection.
          </small>
        </div>
        <div className="auth-bottom">
          A LITTLE LESS SCROLLING. A LOT MORE CINEMA.
        </div>
      </main>
    </div>
  );
}
