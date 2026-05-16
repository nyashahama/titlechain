"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import { DomainIcon } from "@/app/_components/landing/shared/DomainIcons";
import Link from "next/link";

export function RiskEngineTile() {
  return (
    <Link
      href="#security"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.055] md:col-span-5"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-red-500/10">
          <DomainIcon name="risk-engine" className="text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Risk Engine</h3>
        <p className="mt-1 text-sm text-white/45">
          Clear, Review, or Stop decisions with confidence scores
        </p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">Clear</span>
          <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-300">Review</span>
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">Stop</span>
        </div>
      </div>
    </Link>
  );
}
