import Lenis from "lenis";

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (typeof window === "undefined") return null;
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) {
  lenis?.scrollTo(target, options);
}
