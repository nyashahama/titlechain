"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/app/_lib/cn";

export function DataToolbar({
  searchLabel,
  query,
  onQueryChange,
  children,
  className,
}: {
  searchLabel: string;
  query: string;
  onQueryChange: (value: string) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-tc-border pb-4 md:flex-row md:items-center", className)}>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{searchLabel}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tc-text-faint" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchLabel}
          className="h-9 w-full rounded-md border border-tc-border bg-tc-surface-subtle pl-9 pr-3 text-[13px] text-tc-text placeholder:text-tc-text-faint focus:border-tc-accent focus:outline-none"
        />
      </label>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
