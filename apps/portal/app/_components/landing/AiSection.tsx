"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import { cn } from "@/app/_lib/cn";

export function AiSection() {
  return (
    <div className="container py-20">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Pipeline Tile */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <Noise opacity={0.08} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Automated Pipeline
            </p>
            <h3 className="mt-4 text-2xl font-bold text-white">
              Title verification pipeline
            </h3>
            <p className="mt-2 text-sm text-white/45">
              Multi-source data aggregation and automated risk scoring across deeds, bonds, and compliance databases.
            </p>
            <div className="mt-6 space-y-2 font-mono text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&gt;</span>
                <span>Fetching deed records...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&gt;</span>
                <span>Cross-referencing bond data...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&gt;</span>
                <span>Checking FIC alerts...</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">&gt;</span>
                <span>Generating risk score...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Tile */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <Noise opacity={0.08} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
              Decision Intelligence
            </p>
            <h3 className="mt-4 text-2xl font-bold text-white">
              Clear-to-Lodge decisions
            </h3>
            <p className="mt-2 text-sm text-white/45">
              Instant recommendations with confidence scoring: Clear, Review, or Stop — backed by comprehensive data validation.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "Clear", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", pct: "85%" },
                { label: "Review", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", pct: "12%" },
                { label: "Stop", color: "bg-red-500/10 text-red-400 border-red-500/20", pct: "3%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-4",
                    item.color
                  )}
                >
                  <span className="text-lg font-bold">{item.pct}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
