"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import { DomainIcon } from "@/app/_components/landing/shared/DomainIcons";
import Link from "next/link";

export function CoverageTile() {
  return (
    <Link
      href="#coverage"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.055]"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-indigo-500/10">
          <DomainIcon name="coverage" className="text-indigo-400" />
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
