import { ProductPanel } from "@/app/_components/product/ProductPanel";

import { formatDuration } from "../_lib/analytics-format";
import type { AnalyticsOperatingSummary } from "../types";

export function MetricGrid({ summary }: { summary: AnalyticsOperatingSummary }) {
  const metrics = [
    {
      label: "Submitted matters",
      value: formatNumber(summary.submitted_count),
      detail: "New matters in range",
    },
    {
      label: "Resolved matters",
      value: formatNumber(summary.resolved_count),
      detail: "Completed decisions",
    },
    {
      label: "In review",
      value: formatNumber(summary.in_review_count),
      detail: "Active analyst review",
    },
    {
      label: "Unresolved",
      value: formatNumber(summary.unresolved_count),
      detail: "Open or blocked",
    },
    {
      label: "Reopened",
      value: formatNumber(summary.reopened_count),
      detail: "Returned for review",
    },
    {
      label: "Avg. resolve time",
      value: formatDuration(summary.average_seconds_to_resolve),
      detail: "Resolved matters",
    },
    {
      label: "Oldest review",
      value: formatDuration(summary.oldest_in_review_seconds),
      detail: "Longest active review",
    },
    {
      label: "Manual overrides",
      value: formatNumber(summary.manual_override_count),
      detail: `${formatNumber(summary.accepted_proposal_count)} accepted recommendations`,
    },
  ];

  return (
    <ProductPanel aria-labelledby="operating-summary-title" className="space-y-4">
      <div>
        <h2 id="operating-summary-title" className="text-sm font-semibold text-tc-text">
          Operating summary
        </h2>
        <p className="mt-1 text-[13px] text-tc-text-muted">
          Matter throughput and review ageing for the selected range.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-normal text-tc-text">{metric.value}</p>
            <p className="mt-1 text-[12px] text-tc-text-muted">{metric.detail}</p>
          </div>
        ))}
      </div>
    </ProductPanel>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ZA").format(value);
}
