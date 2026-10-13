import Link from "next/link";
export default function NotFound() {
  return (
    <main className="lab">
      <h1>Outside our orbit.</h1>
      <p>That page doesn’t exist.</p>
      <Link href="/">Return to CINEVERSE →</Link>
    </main>
  );
}
