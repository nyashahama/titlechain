"use client";

import { Noise } from "@/app/_components/landing/Fancy";
import Link from "next/link";

export function FraudDetectionTile() {
  return (
    <Link
      href="/solutions/fraud-detection"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)] md:col-span-4"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-purple-500/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7v4c0 5.25 3.83 10.15 9 11 5.17-.85 9-5.75 9-11V7l-9-5z" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">Fraud Detection</h3>
        <p className="mt-1 text-sm text-white/45">
          Cross-reference against FIC and SAPS databases
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
            <div className="text-xs font-medium text-white/45">FIC</div>
            <div className="mt-1 text-sm font-semibold text-emerald-400">Clear</div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
            <div className="text-xs font-medium text-white/45">SAPS</div>
            <div className="mt-1 text-sm font-semibold text-emerald-400">Clear</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
