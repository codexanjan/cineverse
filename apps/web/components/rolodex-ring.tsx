"use client";

import React, { useEffect, useRef, useState } from "react";
import { SerializedMovie } from "../lib/catalog-service";
import { sound } from "../lib/sound";

interface RolodexRingProps {
  movies: any[];
  onSelectMovie?: (movie: any) => void;
  onWatchMovie?: (movie: any) => void;
}

const TAU = Math.PI * 2;
const CARD_COUNT = 22;

export function RolodexRing({
  movies,
  onSelectMovie,
  onWatchMovie,
}: RolodexRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef({
    rotation: 0,
    velocity: 0.0045,
    isDragging: false,
    lastX: 0,
  });

  // Ensure 22 items
  const ringMovies = Array.from({ length: CARD_COUNT }, (_, i) => {
    return movies[i % Math.max(1, movies.length)] || {
      id: i,
      title: `Film ${i + 1}`,
      year: 2024,
      poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      score: 4.5,
      genres: ["Cinema"],
    };
  });

  useEffect(() => {
    let animId: number;
    const stage = containerRef.current;
    if (!stage) return;

    const render = () => {
      const state = stateRef.current;
      const w = stage.clientWidth || 800;
      const h = stage.clientHeight || 600;
      const R = 0.62 * Math.min(w, h);

      // Handle idle drift & momentum release
      if (!state.isDragging) {
        state.velocity += (0.0045 - state.velocity) * 0.02;
        state.rotation += state.velocity;
      }

      // Compute card positions & depths
      const cardData: { idx: number; z: number }[] = [];

      for (let i = 0; i < CARD_COUNT; i++) {
        const a = state.rotation + (i / CARD_COUNT) * TAU;
        const x = Math.sin(a) * R;
        const z = Math.cos(a) * R;
        const y = -Math.cos(a) * R * 0.42; // Tilt derived from z

        const depth = (z / R + 1) / 2; // 0 at back, 1 at front
        const cardEl = cardsRef.current[i];

        if (cardEl) {
          const rotDeg = Math.sin(a) * 14;
          const scale = 0.55 + depth * 0.55;
          const opacity = 0.30 + depth * 0.70;
          const brightness = 0.5 + depth * 0.7;

          cardEl.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) rotate(${rotDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          cardEl.style.opacity = `${opacity.toFixed(3)}`;
          cardEl.style.filter = `brightness(${brightness.toFixed(3)})`;
        }

        cardData.push({ idx: i, z });
      }

      // SORT DEPTH: sort cards ascending by z and write array index into card's z-index
      cardData.sort((a, b) => a.z - b.z);
      for (let rank = 0; rank < cardData.length; rank++) {
        const el = cardsRef.current[cardData[rank].idx];
        if (el) {
          el.style.zIndex = `${rank + 10}`;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Pointer Drag Listeners
    const onPointerDown = (e: PointerEvent) => {
      stage.setPointerCapture(e.pointerId);
      stateRef.current.isDragging = true;
      stateRef.current.velocity = 0;
      stateRef.current.lastX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastX;
      stateRef.current.lastX = e.clientX;
      const moveVel = dx * 0.0045;
      stateRef.current.rotation += moveVel;
      stateRef.current.velocity = moveVel;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (stateRef.current.isDragging) {
        stateRef.current.isDragging = false;
        try {
          stage.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rolodex-stage"
      style={{
        position: "relative",
        width: "100%",
        height: "560px",
        overflow: "hidden",
        perspective: "1200px",
        cursor: "grab",
        userSelect: "none",
        touchAction: "none",
        background: "radial-gradient(ellipse at 50% 60%, rgba(245, 197, 24, 0.05), transparent 70%)",
      }}
    >
      <div
        className="rolodex-center-hub"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "1px",
          height: "1px",
        }}
      >
        {ringMovies.map((movie, i) => (
          <div
            key={movie.id ? `${movie.id}-${i}` : i}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="rolodex-card"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "135px",
              height: "200px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 18px 45px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 197, 24, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              background: "#080c12",
              willChange: "transform, opacity, filter, z-index",
              cursor: "pointer",
            }}
            onClick={(e) => {
              // Click to watch trailer or view details
              e.stopPropagation();
              sound.playClick(600);
              if (onWatchMovie) onWatchMovie(movie as any);
              else if (onSelectMovie) onSelectMovie(movie as any);
            }}
          >
            {movie.poster ? (
              <img
                src={movie.poster.startsWith("http") ? movie.poster : `https://image.tmdb.org/t/p/w342${movie.poster}`}
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none",
                }}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#cbd5e1",
                }}
              >
                {movie.title}
              </div>
            )}

            {/* Title Scrim */}
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0 0",
                padding: "24px 8px 8px",
                background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {movie.title}
              </div>
              <div style={{ fontSize: "9px", color: "var(--gold, #f5c518)", marginTop: "2px" }}>
                {movie.year || "Classic"} · ★ {movie.score ? movie.score.toFixed(1) : "4.8"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Drag Prompt Instruction */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "11px",
          letterSpacing: "1px",
          color: "rgba(255, 255, 255, 0.4)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>✦</span> DRAG WITH MOMENTUM TO SPIN 3D ROLODEX <span>✦</span> TAP TO WATCH TRAILER
      </div>
    </div>
  );
}
