"use client";

import NumberFlow from "@number-flow/react";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { label: "Properties verified", value: 1250000, suffix: "+" },
  { label: "Conveyancing firms", value: 200, suffix: "+" },
  { label: "Titles processed", value: 3800000, suffix: "+" },
  { label: "Risk assessments", value: 5200000, suffix: "+" },
];

const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatMetricFallback(value: number, suffix: string) {
  return `${compactNumberFormat.format(value)}${suffix}`;
}

export function Scale() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (inView) setAnimate(true);
  }, [inView]);

  return (
    <section
      className="relative overflow-hidden border-b border-dashed border-[#d8d8df] bg-[#ededf0] py-24 text-[#1c1c20] md:py-32"
      data-nav-theme="light"
      ref={ref}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(166deg,transparent_0%,transparent_48%,rgba(101,115,255,0.08)_48%,rgba(101,115,255,0.08)_100%)]"
        aria-hidden="true"
      />
      <div className="container relative">
        <h2 className="font-display mx-auto mb-16 max-w-3xl text-center text-4xl font-medium leading-tight text-[#1c1c20] text-pretty md:text-5xl">
          Over {animate ? <NumberFlow value={200} /> : "200"} firms already
          scale with TitleChain
        </h2>

        <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-xl border border-[#d8d8df] bg-white/40 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-dashed border-[#d8d8df] p-6 text-center odd:border-r md:border-r md:last:border-r-0"
            >
              <div className="font-display text-3xl font-medium text-indigo-600 md:text-4xl">
                {animate ? (
                  <NumberFlow
                    value={stat.value}
                    suffix={stat.suffix}
                    format={{ notation: "compact" }}
                  />
                ) : (
                  formatMetricFallback(stat.value, stat.suffix)
                )}
              </div>
              <div className="mt-2 text-xs font-medium text-[#5c5c66]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-xl text-center">
          <blockquote className="text-lg font-medium text-[#3f3f48] italic">
            &ldquo;The value is the evidence trail: every recommendation has the source
            context, risk state, and next action attached.&rdquo;
          </blockquote>
          <div className="mt-4">
            <p className="text-sm font-medium text-[#1c1c20]">Pilot conveyancing lead</p>
            <p className="text-xs text-[#5c5c66]">Regulated property transfer team</p>
          </div>
        </div>
      </div>
    </section>
  );
}
