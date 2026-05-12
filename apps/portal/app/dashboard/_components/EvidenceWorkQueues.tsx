import { AlertTriangle, FileSearch, Link2, type LucideIcon } from "lucide-react";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import type { EvidenceReadinessState, MatterSummary } from "@/app/matters/types";

const queueItems: Array<{
  state: EvidenceReadinessState;
  label: string;
  detail: string;
  icon: LucideIcon;
  className: string;
}> = [
  {
    state: "needs_source_match",
    label: "Needs source match",
    detail: "No confirmed source-backed property match",
    icon: Link2,
    className: "text-tc-warning",
  },
  {
    state: "needs_evidence",
    label: "Needs evidence",
    detail: "Missing confirmed evidence",
    icon: FileSearch,
    className: "text-tc-info",
  },
  {
    state: "exception_approved",
    label: "Exception approved",
    detail: "Decision recorded with evidence exception",
    icon: AlertTriangle,
    className: "text-tc-danger",
  },
];

export function EvidenceWorkQueues({ matters }: { matters: MatterSummary[] }) {
  return (
    <ProductPanel aria-labelledby="evidence-work-queues-title" className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 id="evidence-work-queues-title" className="text-sm font-semibold text-tc-text">
          Evidence work queues
        </h2>
        <p className="text-[13px] text-tc-text-muted">
          Matter readiness exceptions that need evidence or source follow-up.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {queueItems.map((item) => {
          const Icon = item.icon;
          const count = matters.filter((matter) => matter.evidence_readiness?.state === item.state).length;

          return (
            <div key={item.state} className="rounded-md border border-tc-border bg-tc-surface-subtle p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-tc-text-muted">{item.label}</p>
                  <p className="mt-1 text-[11px] text-tc-text-faint">{item.detail}</p>
                </div>
                <Icon className={`size-4 shrink-0 ${item.className}`} aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-tc-text">{count}</p>
            </div>
          );
        })}
      </div>
    </ProductPanel>
  );
}
