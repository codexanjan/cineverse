"use client";

import React, { useState, useEffect } from "react";
import { sound } from "../lib/sound";

interface RailItem {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  gradient: string;
  genre: string;
}

const DEFAULT_ITEMS: RailItem[] = [
  {
    id: "sci-fi",
    eyebrow: "UNIVERSE 01",
    title: "Sci-Fi & Cosmic Horizons",
    desc: "Wormholes, neon futures, and existential journeys beyond human reach.",
    gradient: "linear-gradient(135deg, #1e3a8a, #065f46)",
    genre: "Sci-Fi",
  },
  {
    id: "noir",
    eyebrow: "UNIVERSE 02",
    title: "Psychological Noir & Mystery",
    desc: "Rain-slicked avenues, labyrinthine plots, and shadows that whisper.",
    gradient: "linear-gradient(135deg, #701a75, #b45309)",
    genre: "Mystery",
  },
  {
    id: "aesthetic",
    eyebrow: "UNIVERSE 03",
    title: "Aesthetic Indie & Melancholy",
    desc: "Symmetric pastels, quiet whispers, and tender heartstrings.",
    gradient: "linear-gradient(135deg, #0f172a, #4338ca)",
    genre: "Drama",
  },
  {
    id: "action",
    eyebrow: "UNIVERSE 04",
    title: "Adrenaline & Kinetic Epics",
    desc: "High-octane heists, unrelenting chases, and gritty showdowns.",
    gradient: "linear-gradient(135deg, #312e81, #be185d)",
    genre: "Action",
  },
  {
    id: "animation",
    eyebrow: "UNIVERSE 05",
    title: "Mythic Animation & Comfort",
    desc: "Spirited bathhouses, nostalgic hand-drawn dreams, and warm tea.",
    gradient: "linear-gradient(135deg, #064e3b, #d97706)",
    genre: "Animation",
  },
];

interface ExpandingRailProps {
  onSelectGenre?: (genre: string) => void;
}

export function ExpandingRail({ onSelectGenre }: ExpandingRailProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const handleTouch = () => {
      if (!interval) {
        interval = setInterval(() => {
          setActiveIdx((prev) => (prev + 1) % DEFAULT_ITEMS.length);
        }, 2200);
      }
    };
    window.addEventListener("touchstart", handleTouch, { once: true });
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, []);

  return (
    <div className="expanding-rail-container" style={{ width: "100%", margin: "20px 0" }}>
      <div
        className="expanding-rail-stage"
        style={{
          containerType: "inline-size",
          width: "100%",
          height: "360px",
          display: "flex",
          flexDirection: "row",
          gap: "12px",
          alignItems: "stretch",
          background: "#090c12",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          padding: "14px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
        }}
      >
        {DEFAULT_ITEMS.map((item, i) => {
          const isOpen = activeIdx === i;
          return (
            <div
              key={item.id}
              tabIndex={0}
              className={`expanding-rail-item ${isOpen ? "is-open" : ""}`}
              style={{
                flex: "0 0 auto",
                width: isOpen ? "44%" : "13%",
                height: "100%",
                borderRadius: "12px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                outline: "none",
                filter: isOpen ? "brightness(1.05)" : "brightness(0.8)",
                transition: "width 0.62s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease",
                background: item.gradient,
              }}
              onMouseEnter={() => {
                sound.playClick(480 + i * 30, 0.02);
                setActiveIdx(i);
              }}
              onFocus={() => setActiveIdx(i)}
              onClick={() => {
                sound.playClick(640);
                if (onSelectGenre) onSelectGenre(item.genre);
              }}
            >
              {/* Organic 3D Blob pseudo highlight */}
              <div className="expanding-rail-blob" />
              <div className="expanding-rail-scrim" />

              <div className="expanding-rail-caption">
                <div className="expanding-rail-eyebrow">{item.eyebrow}</div>
                <h3 className="expanding-rail-title">{item.title}</h3>
                <p className="expanding-rail-desc">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
