"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import Link from "next/link";

export function RiskEngineTile() {
  return (
    <Link
      href="/solutions/risk-engine"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)] md:col-span-5"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-red-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 20h20L12 2z" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 10v4M12 18h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Risk Engine</h3>
        <p className="mt-1 text-sm text-white/45">
          Clear, Review, or Stop decisions with confidence scores
        </p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">Clear</span>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">Review</span>
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">Stop</span>
        </div>
      </div>
    </Link>
  );
}
