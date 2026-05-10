"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import Link from "next/link";

export function BondCheckTile() {
  return (
    <Link
      href="/solutions/bond-check"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)] md:col-span-4"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-teal-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke="#14b8a6" strokeWidth="2"/>
            <path d="M2 10h20" stroke="#14b8a6" strokeWidth="2"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Bond Check</h3>
        <p className="mt-1 text-sm text-white/45">
          Verify bond status, outstanding amounts, and interdicts
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <span className="text-xs text-white/45">Bond status</span>
            <span className="text-xs font-medium text-teal-400">Active</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <span className="text-xs text-white/45">Interdicts</span>
            <span className="text-xs font-medium text-emerald-400">None</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
