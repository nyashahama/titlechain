"use client";

import { useEffect } from "react";
import { initSmoothScroll } from "@/app/_lib/smooth-scroll";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSmoothScroll();
  }, []);

  return <>{children}</>;
}
