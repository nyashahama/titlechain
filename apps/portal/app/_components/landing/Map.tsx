"use client";

import { SVGMap } from "./Map/SVGMap";
import { motion } from "framer-motion";

const locations = [
  { name: "Johannesburg", x: 300, y: 95, status: "clearing" as const },
  { name: "Cape Town", x: 170, y: 155, status: "verifying" as const },
  { name: "Durban", x: 340, y: 120, status: "clearing" as const },
  { name: "Pretoria", x: 290, y: 85, status: "verifying" as const },
  { name: "Port Elizabeth", x: 240, y: 150, status: "active" as const },
  { name: "Bloemfontein", x: 260, y: 115, status: "active" as const },
];

const statusConfig = {
  verifying: {
    color: "bg-indigo-300",
    pulse: "bg-indigo-300/30",
    label: "Verifying",
  },
  clearing: {
    color: "bg-emerald-400",
    pulse: "bg-emerald-400/30",
    label: "Clearing",
  },
  active: {
    color: "bg-blue-400",
    pulse: "bg-blue-400/30",
    label: "Active",
  },
};

export function Map() {
  return (
    <section
      className="scroll-mt-24 border-b border-dashed border-[#d8d8df] bg-[#ededf0] py-24 text-[#1c1c20] md:py-32"
      data-nav-theme="light"
      id="coverage"
    >
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600/75">
            Coverage
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-[#1c1c20] text-pretty md:text-5xl">
            Nationwide coverage across South Africa
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[#5c5c66]">
            Real-time title intelligence in every province, every deeds office.
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-xl border border-[#d8d8df] bg-white/45 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(127,132,153,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(127,132,153,0.13)_1px,transparent_1px)] [background-size:72px_72px]"
              aria-hidden="true"
            />
            <SVGMap className="relative h-auto w-full" />

            {locations.map((loc) => (
              <motion.div
                key={loc.name}
                className="absolute flex items-center gap-2"
                style={{
                  left: `${(loc.x / 481) * 100}%`,
                  top: `${(loc.y / 201) * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative flex size-3 items-center justify-center">
                  <div
                    className={`absolute inset-0 animate-ping rounded-full ${statusConfig[loc.status].pulse}`}
                  />
                  <div
                    className={`size-2 rounded-full ${statusConfig[loc.status].color}`}
                  />
                </div>
                <span className="text-[0.625rem] font-medium text-[#5c5c66]">
                  {loc.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-6">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${config.color}`} />
              <span className="text-xs text-[#5c5c66]">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
