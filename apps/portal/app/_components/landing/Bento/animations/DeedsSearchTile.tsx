"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import Link from "next/link";

export function DeedsSearchTile() {
  return (
    <Link
      href="/solutions/deeds-search"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)] md:col-span-4"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="7" stroke="#3b82f6" strokeWidth="2"/>
            <path d="M16.5 16.5L21 21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Deeds Search</h3>
        <p className="mt-1 text-sm text-white/45">
          Full-text search across all South African property deeds
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <span className="text-xs text-white/30">Search by erf number, owner, or title deed...</span>
        </div>
      </div>
    </Link>
  );
}
