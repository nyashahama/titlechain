"use client";

import { useState, useEffect } from "react";
import { Noise } from "@/app/_components/landing/Fancy";
import { DomainIcon } from "@/app/_components/landing/shared/DomainIcons";
import Link from "next/link";

export function ClearToLodgeTile() {
  const [text, setText] = useState("");
  const fullText = "Verifying deed: T12345/2024...";
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 800);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="#solutions"
      className="group relative col-span-12 flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-shadow hover:shadow-[0px_0px_0px_4px_hsl(0_0%_6%)] md:col-span-7"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <Noise opacity={0.08} />
      </div>
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-indigo-500/10">
          <DomainIcon name="clear-to-lodge" className="text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Clear-to-Lodge</h3>
        <p className="mt-1 text-sm text-white/45">
          Aggregate data from deeds, bonds, municipal, and FIC signals
        </p>
        <div className="mt-4 font-mono text-xs text-emerald-400">
          {text}
          <span className="animate-caret-blink ml-0.5 inline-block h-3 w-0.5 bg-emerald-400 align-middle" />
        </div>
        {done && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            Clear to Lodge
          </span>
        )}
      </div>
    </Link>
  );
}
