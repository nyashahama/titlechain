"use client";

import { SVGMap } from "@/app/_components/solar/ui/Map/SVGMap";
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
    color: "bg-amber-400",
    pulse: "bg-amber-400/30",
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
    <div className="container py-20" id="coverage">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Nationwide coverage across South Africa
        </h2>
        <p className="mt-4 text-sm text-white/45">
          Real-time title intelligence in every province, every deeds office
        </p>
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="relative rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-8">
          <SVGMap className="h-auto w-full" />

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
              <span className="text-[0.625rem] font-medium text-white/50">
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
            <span className="text-xs text-white/40">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
