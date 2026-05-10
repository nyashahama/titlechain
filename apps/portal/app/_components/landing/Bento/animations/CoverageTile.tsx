"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import Link from "next/link";

export function CoverageTile() {
  return (
    <Link
      href="/solutions/coverage"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#F97316" strokeWidth="2"/>
            <path d="M12 2v20M2 12h20" stroke="#F97316" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Coverage</h3>
        <p className="mt-1 text-sm text-white/45">
          Nationwide coverage across all 9 provinces
        </p>
        <div className="mt-4 grid grid-cols-3 gap-1">
          {["GP", "WC", "KZN", "EC", "FS", "NW", "LP", "MP", "NC"].map(
            (prov) => (
              <div
                key={prov}
                className="flex items-center justify-center rounded border border-white/[0.06] bg-white/[0.02] py-1.5"
              >
                <span className="text-xs font-medium text-white/60">{prov}</span>
              </div>
            )
          )}
        </div>
      </div>
    </Link>
  );
}
