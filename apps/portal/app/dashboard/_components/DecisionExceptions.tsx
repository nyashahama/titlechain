import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { CopyAction } from "@/app/_components/product/CopyAction";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { getDecisionMeta, getMatterStatusMeta } from "@/app/_lib/product/status";
import type { MatterSummary } from "@/app/matters/types";

export function DecisionExceptions({ matters }: { matters: MatterSummary[] }) {
  const exceptions = matters
    .filter((matter) => matter.decision === "stop" || matter.decision === "review")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <ProductPanel aria-labelledby="decision-exceptions-title" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-tc-warning" aria-hidden="true" />
            <h2 id="decision-exceptions-title" className="text-sm font-semibold text-tc-text">
              Decision exceptions
            </h2>
          </div>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            Stop and review outcomes requiring operator attention.
          </p>
        </div>
        <span className="w-fit rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-[12px] text-tc-text-muted">
          {exceptions.length} open exception{exceptions.length === 1 ? "" : "s"}
        </span>
      </div>

      {exceptions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-tc-border bg-tc-surface-subtle px-4 py-8 text-center">
          <p className="text-sm font-medium text-tc-text">No stop/review decisions currently.</p>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            Exception queue is clear; continue monitoring new submissions.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-tc-border overflow-hidden rounded-lg border border-tc-border">
          {exceptions.map((matter) => {
            const decision = getDecisionMeta(matter.decision);
            const status = getMatterStatusMeta(matter.customer_status);

            return (
              <div key={matter.id} className="grid gap-3 bg-tc-surface-subtle p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/matters/${matter.id}`}
                      className="min-w-0 truncate text-sm font-medium text-tc-text hover:text-tc-info"
                    >
                      {matter.property_description}
                    </Link>
                    <CopyAction text={matter.case_reference} label={`Copy ${matter.case_reference}`} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-tc-text-muted">
                    <span className="font-mono text-tc-text-faint">{matter.case_reference}</span>
                    <span aria-hidden="true">/</span>
                    <span className="truncate">{matter.locality_or_area}</span>
                    <span aria-hidden="true">/</span>
                    <span className="truncate">{matter.municipality_or_deeds_office}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ProductStatusBadge label={decision.label} tone={decision.tone} />
                    <ProductStatusBadge label={status.label} tone={status.tone} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <RelativeTime date={matter.updated_at} />
                  <Link
                    href={`/matters/${matter.id}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-tc-text-muted hover:bg-white/[0.05] hover:text-tc-text"
                    aria-label={`Open ${matter.case_reference}`}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProductPanel>
  );
}
