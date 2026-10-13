"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function CinematicEntrance({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        // Entrance Timeline
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".intro-nav", {
          y: -30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        })
          .from(
            ".intro-copy > *",
            {
              y: 35,
              opacity: 0,
              duration: 0.85,
              stagger: 0.08,
            },
            "-=0.5",
          )
          .from(
            ".orbit-film",
            {
              y: 75,
              opacity: 0,
              scale: 0.8,
              rotation: "random(-15, 15)",
              duration: 1.2,
              stagger: 0.12,
              ease: "back.out(1.4)",
            },
            "-=0.7",
          )
          .from(
            ".universe-ring",
            {
              scale: 0.6,
              opacity: 0,
              duration: 1.4,
              stagger: 0.2,
              ease: "expo.out",
            },
            "-=1.1",
          )
          .from(
            ".floating-label",
            {
              y: 20,
              scale: 0.85,
              opacity: 0,
              duration: 0.7,
              stagger: 0.15,
              ease: "back.out(1.7)",
            },
            "-=0.6",
          )
          .from(
            ".cinematic-ticker",
            {
              opacity: 0,
              scaleX: 0.95,
              duration: 0.8,
            },
            "-=0.4",
          )
          .from(
            ".compact-discovery",
            {
              opacity: 0,
              y: 25,
              duration: 0.65,
            },
            "-=0.5",
          );

        // Continuous Infinite Orbital Ring Rotations
        gsap.to(".ring-one", {
          rotation: "+=360",
          duration: 75,
          repeat: -1,
          ease: "none",
        });

        gsap.to(".ring-two", {
          rotation: "-=360",
          duration: 95,
          repeat: -1,
          ease: "none",
        });

        // Sinusoidal floating physics on posters
        gsap.utils.toArray<HTMLElement>(".orbit-film").forEach((el, index) => {
          gsap.to(el, {
            y: "+=14",
            duration: 3 + index * 0.45,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2,
          });
        });

        // 3D Parallax Tilt for Film Universe
        const universe = root.current?.querySelector<HTMLElement>(".film-universe");
        if (universe) {
          let ticking = false;
          const onMove = (e: MouseEvent) => {
            if (!ticking) {
              requestAnimationFrame(() => {
                const rect = universe.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(universe, {
                  rotateY: x * 12,
                  rotateX: -y * 12,
                  transformPerspective: 1000,
                  duration: 0.6,
                  ease: "power2.out",
                  overwrite: "auto",
                });

                gsap.to(".universe-ring", {
                  x: x * 20,
                  y: y * 20,
                  duration: 0.8,
                  ease: "power1.out",
                  overwrite: "auto",
                });
                ticking = false;
              });
              ticking = true;
            }
          };

          const onLeave = () => {
            gsap.to(universe, {
              rotateY: 0,
              rotateX: 0,
              duration: 0.9,
              ease: "power3.out",
              overwrite: "auto",
            });
            gsap.to(".universe-ring", {
              x: 0,
              y: 0,
              duration: 1.1,
              ease: "power2.out",
              overwrite: "auto",
            });
          };

          universe.addEventListener("mousemove", onMove);
          universe.addEventListener("mouseleave", onLeave);
        }

        // Ambient Spotlight Follower across Hero with 60fps quickTo
        const hero = root.current?.querySelector<HTMLElement>(".intro-hero");
        const ambientSpotlight = root.current?.querySelector<HTMLElement>(".hero-ambient-cursor");
        if (hero && ambientSpotlight) {
          const xSpot = gsap.quickTo(ambientSpotlight, "x", { duration: 0.35, ease: "power2.out" });
          const ySpot = gsap.quickTo(ambientSpotlight, "y", { duration: 0.35, ease: "power2.out" });

          const onHeroMouseMove = (e: MouseEvent) => {
            const rect = hero.getBoundingClientRect();
            xSpot(e.clientX - rect.left);
            ySpot(e.clientY - rect.top);
            gsap.to(ambientSpotlight, { opacity: 0.65, duration: 0.2, overwrite: "auto" });
          };

          const onHeroMouseLeave = () => {
            gsap.to(ambientSpotlight, {
              opacity: 0,
              duration: 0.6,
              ease: "power2.inOut",
            });
          };

          hero.addEventListener("mousemove", onHeroMouseMove);
          hero.addEventListener("mouseleave", onHeroMouseLeave);
        }
      }, root);

      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <div className="intro-page compact-landing" ref={root}>
      {children}
    </div>
  );
}
