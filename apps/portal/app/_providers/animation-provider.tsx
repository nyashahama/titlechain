"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { initSmoothScroll, destroySmoothScroll } from "@/app/_lib/smooth-scroll";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = initSmoothScroll();
    return cleanup;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
