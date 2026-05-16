"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import { cn } from "@/app/_lib/cn";

export function AiSection() {
  return (
    <section className="border-y border-dashed border-white/[0.06] bg-[#03040a]/50 py-24 md:py-32">
      <div className="container">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300/70">
            Automation
          </p>
          <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-white text-pretty md:text-5xl">
            Title workflows that stay legible under pressure
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-white/45">
            Keep registry checks, risk scoring, and final recommendations in
            one visible chain of evidence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Pipeline Tile */}
          <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.055]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <Noise opacity={0.08} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Automated Pipeline
              </p>
              <h3 className="font-display mt-4 text-2xl font-medium text-white">
                Title verification pipeline
              </h3>
              <p className="mt-2 text-sm text-white/45">
                Multi-source data aggregation and automated risk scoring across
                deeds, bonds, and compliance databases.
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
          <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.055]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <Noise opacity={0.08} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Decision Intelligence
              </p>
              <h3 className="font-display mt-4 text-2xl font-medium text-white">
                Clear-to-Lodge decisions
              </h3>
              <p className="mt-2 text-sm text-white/45">
                Instant recommendations with confidence scoring: Clear, Review,
                or Stop - backed by comprehensive data validation.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Clear",
                    color:
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    pct: "85%",
                  },
                  {
                    label: "Review",
                    color: "bg-sky-500/10 text-sky-300 border-sky-500/20",
                    pct: "12%",
                  },
                  {
                    label: "Stop",
                    color: "bg-red-500/10 text-red-400 border-red-500/20",
                    pct: "3%",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-4",
                      item.color
                    )}
                  >
                    <span className="text-lg font-semibold">{item.pct}</span>
                    <span className="text-xs">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
