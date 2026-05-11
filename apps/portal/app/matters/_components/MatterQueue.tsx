"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyAction } from "@/app/_components/product/CopyAction";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { StateView } from "@/app/_components/product/StateView";
import { filterMatters, type MatterFilterState } from "@/app/_lib/product/matter-metrics";
import { getDecisionMeta, getMatterStatusMeta } from "@/app/_lib/product/status";
import type { MatterSummary } from "../types";
import { MatterFilters } from "./MatterFilters";

const initialFilters: MatterFilterState = {
  query: "",
  status: "all",
  decision: "all",
};

export function MatterQueue({ matters }: { matters: MatterSummary[] }) {
  const [filters, setFilters] = useState<MatterFilterState>(initialFilters);
  const filteredMatters = useMemo(() => filterMatters(matters, filters), [matters, filters]);

  return (
    <section className="flex flex-col gap-4">
      <MatterFilters filters={filters} onFiltersChange={setFilters} />

      {filteredMatters.length === 0 ? (
        <StateView
          kind="empty"
          title="No matters found"
          description="Adjust the search or filters to find matching matters."
          className="rounded-lg border border-tc-border bg-tc-surface"
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-tc-border bg-tc-surface">
          <div className="divide-y divide-tc-border">
            {filteredMatters.map((matter) => {
              const status = getMatterStatusMeta(matter.customer_status);
              const decision = getDecisionMeta(matter.decision);

              return (
                <div
                  key={matter.id}
                  className="group relative grid min-h-[92px] grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[minmax(0,1fr)_150px_130px_80px] sm:items-center sm:gap-4"
                >
                  <Link
                    href={`/matters/${matter.id}`}
                    className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tc-accent"
                  >
                    <span className="sr-only">Open matter {matter.case_reference}</span>
                  </Link>
                  <div className="pointer-events-none relative z-10 min-w-0">
                    <div className="mb-1 flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-mono text-[11px] text-tc-text-faint tabular-nums">
                        {matter.case_reference}
                      </span>
                      <span
                        className="pointer-events-auto shrink-0 opacity-100 focus-within:opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <CopyAction text={matter.case_reference} label={`Copy ${matter.case_reference}`} />
                      </span>
                    </div>
                    <p className="truncate text-[13px] font-medium text-tc-text">{matter.property_description}</p>
                    <p className="mt-1 truncate text-[12px] text-tc-text-muted">
                      {matter.locality_or_area} · {matter.municipality_or_deeds_office}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-tc-text-faint">{matter.customer_reference}</p>
                  </div>

                  <div className="pointer-events-none relative z-10 flex flex-col items-end gap-2 sm:items-start">
                    <ProductStatusBadge label={status.label} tone={status.tone} />
                    <span className="sm:hidden">
                      <ProductStatusBadge label={decision.label} tone={decision.tone} />
                    </span>
                  </div>

                  <div className="pointer-events-none relative z-10 hidden min-w-0 sm:block">
                    <ProductStatusBadge label={decision.label} tone={decision.tone} />
                  </div>

                  <div className="pointer-events-none relative z-10 col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
                    <RelativeTime date={matter.updated_at} />
                    <ChevronRight className="size-4 shrink-0 text-tc-text-faint transition-colors group-hover:text-tc-text-muted" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
