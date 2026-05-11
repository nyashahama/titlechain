import Link from "next/link";
import { Clock3 } from "lucide-react";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { getDecisionMeta, getMatterStatusMeta } from "@/app/_lib/product/status";
import type { MatterSummary } from "@/app/matters/types";

export function RecentActivity({ matters }: { matters: MatterSummary[] }) {
  const activity = [...matters]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <ProductPanel aria-labelledby="recent-activity-title" className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock3 className="size-4 text-tc-text-faint" aria-hidden="true" />
        <h2 id="recent-activity-title" className="text-sm font-semibold text-tc-text">
          Recent activity
        </h2>
      </div>

      {activity.length === 0 ? (
        <div className="rounded-lg border border-dashed border-tc-border bg-tc-surface-subtle px-4 py-8 text-center">
          <p className="text-sm font-medium text-tc-text">No activity yet.</p>
          <p className="mt-1 text-[13px] text-tc-text-muted">Matter updates will appear here as the queue changes.</p>
        </div>
      ) : (
        <div className="divide-y divide-tc-border overflow-hidden rounded-lg border border-tc-border">
          {activity.map((matter) => {
            const status = getMatterStatusMeta(matter.customer_status);
            const decision = getDecisionMeta(matter.decision);

            return (
              <Link
                key={matter.id}
                href={`/matters/${matter.id}`}
                className="grid gap-3 bg-tc-surface-subtle p-4 transition-colors hover:bg-white/[0.04] sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-tc-text">{matter.property_description} updated</p>
                  <p className="mt-1 truncate font-mono text-[12px] text-tc-text-faint">{matter.case_reference}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <ProductStatusBadge label={status.label} tone={status.tone} />
                  <ProductStatusBadge label={decision.label} tone={decision.tone} />
                  <RelativeTime date={matter.updated_at} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </ProductPanel>
  );
}
