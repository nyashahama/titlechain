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
      className="border-y border-dashed border-white/[0.06] bg-[#03040a]/70 py-24 md:py-32"
      ref={ref}
    >
      <div className="container">
        <h2 className="font-display mx-auto mb-16 max-w-3xl text-center text-4xl font-medium leading-tight text-white text-pretty md:text-5xl">
          Over {animate ? <NumberFlow value={200} /> : "200"} firms already
          scale with TitleChain
        </h2>

        <div className="mx-auto grid max-w-5xl grid-cols-2 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-dashed border-white/[0.08] p-6 text-center odd:border-r md:border-r md:last:border-r-0"
            >
              <div className="font-display text-3xl font-medium text-indigo-300 md:text-4xl">
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
              <div className="mt-2 text-xs font-medium text-white/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-xl text-center">
          <blockquote className="text-lg font-medium text-white/70 italic">
            &ldquo;The value is the evidence trail: every recommendation has the source
            context, risk state, and next action attached.&rdquo;
          </blockquote>
          <div className="mt-4">
            <p className="text-sm font-medium text-white">Pilot conveyancing lead</p>
            <p className="text-xs text-white/40">Regulated property transfer team</p>
          </div>
        </div>
      </div>
    </section>
  );
}
