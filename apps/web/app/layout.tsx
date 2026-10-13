import "./globals.css";
import "./intro.css";
import "./profile.css";
import type { Metadata } from "next";
import { MotionProvider } from "../components/motion-provider";
export const metadata: Metadata = {
  title: "CINEVERSE — Find your next feeling",
  description:
    "A new universe of movies. Discover films through mood, taste and a little serendipity.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
