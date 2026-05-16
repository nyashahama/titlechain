"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import { DomainIcon } from "@/app/_components/landing/shared/DomainIcons";
import Link from "next/link";

export function DeedsSearchTile() {
  return (
    <Link
      href="#solutions"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.055] md:col-span-4"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
          <DomainIcon name="deeds-search" className="text-blue-400" />
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
