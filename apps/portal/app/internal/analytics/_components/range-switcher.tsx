import Link from "next/link";

import { cn } from "@/app/_lib/cn";

import { rangeLabel } from "../_lib/analytics-format";
import type { AnalyticsRange, AnalyticsRangeKey } from "../types";

const ranges: AnalyticsRangeKey[] = ["7d", "30d", "90d", "all"];

export function RangeSwitcher({
  selectedRange,
  range,
}: {
  selectedRange: AnalyticsRangeKey;
  range: AnalyticsRange;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-tc-border bg-tc-surface p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Range</p>
        <p className="mt-1 text-[13px] text-tc-text-muted">
          {formatWindow(range)}
        </p>
      </div>
      <nav aria-label="Analytics range" className="flex flex-wrap gap-2">
        {ranges.map((key) => {
          const active = key === selectedRange;

          return (
            <Link
              key={key}
              href={`/internal/analytics?range=${key}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-md border px-3 text-[12px] font-medium transition-colors",
                active
                  ? "border-tc-info/40 bg-tc-info/10 text-tc-info"
                  : "border-tc-border bg-tc-surface-subtle text-tc-text-muted hover:bg-white/[0.05] hover:text-tc-text"
              )}
            >
              {rangeLabel(key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function formatWindow(range: AnalyticsRange): string {
  if (!range.from) {
    return `Showing ${rangeLabel(range.key).toLowerCase()} through ${formatDate(range.to)}`;
  }

  return `${formatDate(range.from)} to ${formatDate(range.to)}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
