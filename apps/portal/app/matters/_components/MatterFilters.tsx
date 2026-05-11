"use client";

import { DataToolbar } from "@/app/_components/product/DataToolbar";
import { cn } from "@/app/_lib/cn";
import type { MatterDecisionFilter, MatterFilterState, MatterStatusFilter } from "@/app/_lib/product/matter-metrics";

const statusOptions: { label: string; value: MatterStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "submitted" },
  { label: "In Review", value: "in_review" },
  { label: "Resolved", value: "resolved" },
  { label: "Reopened", value: "reopened" },
];

const decisionOptions: { label: string; value: MatterDecisionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Clear", value: "clear" },
  { label: "Review", value: "review" },
  { label: "Stop", value: "stop" },
  { label: "Pending", value: "pending" },
];

function FilterButton({
  active,
  ariaLabel,
  children,
  onClick,
}: {
  active: boolean;
  ariaLabel?: string;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 text-[12px] font-medium transition-colors",
        active
          ? "border-tc-accent bg-tc-accent/10 text-tc-text"
          : "border-tc-border bg-tc-surface-subtle text-tc-text-muted hover:border-tc-border-strong hover:text-tc-text"
      )}
    >
      {children}
    </button>
  );
}

export function MatterFilters({
  filters,
  onFiltersChange,
}: {
  filters: MatterFilterState;
  onFiltersChange: (filters: MatterFilterState) => void;
}) {
  return (
    <DataToolbar
      searchLabel="Search matters"
      query={filters.query}
      onQueryChange={(query) => onFiltersChange({ ...filters, query })}
    >
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Matter status">
        {statusOptions.map((option) => (
          <FilterButton
            key={option.value}
            active={filters.status === option.value}
            ariaLabel={option.value === "all" ? "All statuses" : undefined}
            onClick={() => onFiltersChange({ ...filters, status: option.value })}
          >
            {option.label}
          </FilterButton>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Matter decision">
        {decisionOptions.map((option) => (
          <FilterButton
            key={option.value}
            active={filters.decision === option.value}
            ariaLabel={option.value === "all" ? "All decisions" : undefined}
            onClick={() => onFiltersChange({ ...filters, decision: option.value })}
          >
            {option.label}
          </FilterButton>
        ))}
      </div>
    </DataToolbar>
  );
}
