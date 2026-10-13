"use client";

import React, { useEffect, useRef } from "react";

interface ParticleCloakProps {
  title?: string;
  subtitle?: string;
  height?: number | string;
}

export function ParticleCloak({
  title = "THE NEURAL VAULT",
  subtitle = "9,742 STORIES · TASTE SYNESTHESIA · WAVELENGTH",
  height = 360,
}: ParticleCloakProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = host.clientWidth;
    let h = host.clientHeight;
    let dpr = window.devicePixelRatio || 1;

    class Particle {
      homeX: number;
      homeY: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor(homeX: number, homeY: number) {
        this.homeX = homeX;
        this.homeY = homeY;
        this.x = homeX;
        this.y = homeY;
        this.vx = 0;
        this.vy = 0;
        this.radius = 1 + Math.random() * 1.6;
      }
    }

    let particles: Particle[] = [];
    const initParticles = () => {
      particles = [];
      const step = Math.max(9, Math.min(w, h) / 22);
      for (let x = 0; x <= w + step; x += step) {
        for (let y = 0; y <= h + step; y += step) {
          particles.push(new Particle(x, y));
        }
      }
    };

    const resize = () => {
      if (!host || !canvas || !ctx) return;
      w = host.clientWidth;
      h = host.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    resize();

    let pointer = { x: w / 2, y: h / 2 };
    let eased = { x: w / 2, y: h / 2 };
    let hasEntered = false;
    let isTouch = false;
    let time = 0;
    let animId: number;

    const loop = () => {
      time += 0.02;
      const minDim = Math.min(w, h);
      const R = 0.34 * minDim;

      if (!hasEntered || isTouch) {
        const lissX = w / 2 + Math.sin(time * 0.7) * (w * 0.32);
        const lissY = h / 2 + Math.sin(time * 1.1 + 0.4) * (h * 0.28);
        if (!hasEntered) {
          pointer.x = lissX;
          pointer.y = lissY;
        }
      }

      eased.x += (pointer.x - eased.x) * 0.16;
      eased.y += (pointer.y - eased.y) * 0.16;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - eased.x;
        const dy = p.y - eased.y;
        const dist = Math.hypot(dx, dy) || 0.001;

        if (dist < R) {
          const f = Math.pow(1 - dist / R, 2) * 3.4;
          const nx = dx / dist;
          const ny = dy / dist;
          p.vx += nx * f;
          p.vy += ny * f;
        }

        // Pull home
        p.vx += (p.homeX - p.x) * 0.024;
        p.vy += (p.homeY - p.y) * 0.024;

        // Damp
        p.vx *= 0.86;
        p.vy *= 0.86;

        // Integrate
        p.x += p.vx;
        p.y += p.vy;

        // Fade by displacement
        const distHome = Math.hypot(p.x - p.homeX, p.y - p.homeY);
        const alpha = Math.max(0, 0.72 - distHome / 70);

        if (alpha > 0.01) {
          ctx.fillStyle = `rgba(245, 197, 24, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const onEnter = () => {
      hasEntered = true;
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      hasEntered = true;
    };
    const onLeave = () => {
      hasEntered = false;
    };
    const onTouch = () => {
      isTouch = true;
      hasEntered = true;
    };

    window.addEventListener("resize", resize);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("touchstart", onTouch);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="particle-cloak-host"
      style={{
        position: "relative",
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: "16px",
        overflow: "hidden",
        background: "#080b11",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="particle-cloak-underneath"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "30px",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(26px, 4vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-1px",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #ffffff 20%, #f5c518 70%, #ff8a00 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 10px 0",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: "11px",
            letterSpacing: "1.5px",
            color: "rgba(255, 255, 255, 0.6)",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "crosshair",
        }}
      />
    </div>
  );
}
