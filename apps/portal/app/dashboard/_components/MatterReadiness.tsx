import Link from "next/link";
import { ChevronRight, ListChecks } from "lucide-react";
import { CopyAction } from "@/app/_components/product/CopyAction";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { getDecisionMeta, getMatterStatusMeta } from "@/app/_lib/product/status";
import type { MatterSummary } from "@/app/matters/types";

export function MatterReadiness({ matters }: { matters: MatterSummary[] }) {
  const latestMatters = [...matters]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6);

  return (
    <ProductPanel aria-labelledby="matter-readiness-title" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-tc-success" aria-hidden="true" />
            <h2 id="matter-readiness-title" className="text-sm font-semibold text-tc-text">
              Matter readiness
            </h2>
          </div>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            Latest matters by operational update, with decision and customer status side by side.
          </p>
        </div>
        <Link href="/matters" className="text-[12px] font-medium text-tc-text-muted hover:text-tc-text">
          View all {matters.length}
        </Link>
      </div>

      {latestMatters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-tc-border bg-tc-surface-subtle px-4 py-8 text-center">
          <p className="text-sm font-medium text-tc-text">No matters in the command center.</p>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            New Clear-to-Lodge checks will appear here once submitted.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-tc-border overflow-hidden rounded-lg border border-tc-border">
          {latestMatters.map((matter) => {
            const decision = getDecisionMeta(matter.decision);
            const status = getMatterStatusMeta(matter.customer_status);

            return (
              <div key={matter.id} className="grid gap-3 bg-tc-surface-subtle p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <Link
                      href={`/matters/${matter.id}`}
                      className="min-w-0 truncate text-sm font-medium text-tc-text hover:text-tc-info"
                    >
                      {matter.property_description} - {matter.locality_or_area}
                    </Link>
                    <CopyAction text={matter.case_reference} label={`Copy ${matter.case_reference}`} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-tc-text-muted">
                    <span className="font-mono text-tc-text-faint">{matter.case_reference}</span>
                    <span aria-hidden="true">/</span>
                    <span className="truncate">{matter.customer_reference || "No customer reference"}</span>
                    <span aria-hidden="true">/</span>
                    <span className="truncate">{matter.title_reference || "No title reference"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ProductStatusBadge label={decision.label} tone={decision.tone} />
                  <ProductStatusBadge label={status.label} tone={status.tone} />
                </div>
                <div className="flex items-center justify-between gap-3 lg:justify-end">
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
