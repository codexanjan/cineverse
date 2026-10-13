"use client";
import Image from "next/image";
import { useRef, useState } from "react";
export function Poster({
  path,
  title,
  priority = false,
  movieId,
}: {
  path: string | null;
  title: string;
  priority?: boolean;
  movieId?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [poster, setPoster] = useState(path);
  const attempted = useRef(false);
  async function recover() {
    if (!movieId || attempted.current) {
      setFailed(true);
      return;
    }
    attempted.current = true;
    try {
      const r = await fetch(`/api/movies/${movieId}/artwork`);
      if (!r.ok) throw new Error();
      const result = await r.json();
      if (result.poster && result.poster !== poster) setPoster(result.poster);
      else setFailed(true);
    } catch {
      setFailed(true);
    }
  }
  return (
    <Image
      src={
        poster && !failed
          ? `https://image.tmdb.org/t/p/w500${poster}`
          : "/poster.svg"
      }
      alt={title}
      fill
      sizes="(max-width: 700px) 50vw, 300px"
      unoptimized
      priority={priority}
      onError={recover}
    />
  );
}
