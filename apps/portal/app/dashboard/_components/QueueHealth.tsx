import { Activity, ClipboardCheck, RotateCcw } from "lucide-react";
import type { MatterSummary } from "@/app/matters/types";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { buildMatterMetrics } from "@/app/_lib/product/matter-metrics";

const metricItems = [
  { key: "total", label: "Total", detail: "All matters in queue" },
  { key: "submitted", label: "Submitted", detail: "Awaiting triage" },
  { key: "inReview", label: "In Review", detail: "Being assessed" },
  { key: "resolved", label: "Resolved", detail: "Decision issued" },
  { key: "reopened", label: "Reopened", detail: "Returned to queue" },
] as const;

export function QueueHealth({ matters }: { matters: MatterSummary[] }) {
  const metrics = buildMatterMetrics(matters);
  const activeQueue = metrics.submitted + metrics.inReview + metrics.reopened;

  return (
    <ProductPanel aria-labelledby="queue-health-title" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-tc-info" aria-hidden="true" />
            <h2 id="queue-health-title" className="text-sm font-semibold text-tc-text">
              Queue health
            </h2>
          </div>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            Current operational load across submitted, review, resolved, and reopened matters.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2">
          <ClipboardCheck className="size-4 text-tc-text-muted" aria-hidden="true" />
          <span className="text-[12px] text-tc-text-muted">
            Active queue <span className="font-semibold text-tc-text">{activeQueue}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metricItems.map((item) => (
          <div key={item.key} className="rounded-lg border border-tc-border bg-tc-surface-subtle p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-medium text-tc-text-muted">{item.label}</p>
              {item.key === "reopened" ? (
                <RotateCcw className="size-3.5 text-tc-warning" aria-hidden="true" />
              ) : null}
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-tc-text">{metrics[item.key]}</p>
            <p className="mt-1 text-[11px] text-tc-text-faint">{item.detail}</p>
          </div>
        ))}
      </div>
    </ProductPanel>
  );
}
