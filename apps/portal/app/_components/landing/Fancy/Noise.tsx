import { cn } from "@/app/_lib/cn";

interface NoiseProps {
  opacity?: number;
  className?: string;
}

export function Noise({ opacity = 0.15, className }: NoiseProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" className="absolute inset-0">
        <filter id="landing-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#landing-noise)" />
      </svg>
    </div>
  );
}
