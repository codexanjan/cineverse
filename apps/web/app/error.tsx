"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="lab">
      <h1>A brief interruption.</h1>
      <p>We couldn’t load your universe. Please try again.</p>
      <button className="primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
