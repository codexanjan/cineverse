"use client";
import { MotionConfig } from "framer-motion";
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </MotionConfig>
  );
}
