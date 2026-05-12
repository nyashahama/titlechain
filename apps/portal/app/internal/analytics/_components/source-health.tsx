import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

import { runStatusTone, titleize } from "../_lib/analytics-format";
import type { AnalyticsSourceHealth } from "../types";

export function SourceHealth({ health }: { health: AnalyticsSourceHealth }) {
  const latestRunLabel = health.latest_run_id || "No run recorded";
  const latestError = health.latest_error.trim() || "No latest error";
  const stats = [
    { label: "Source links", value: formatNumber(health.source_link_count) },
    { label: "Pending jobs", value: formatNumber(health.pending_job_count) },
    { label: "Failed jobs", value: formatNumber(health.failed_job_count) },
    { label: "Quarantined records", value: formatNumber(health.quarantined_record_count) },
  ];

  return (
    <ProductPanel aria-labelledby="source-health-title" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="source-health-title" className="text-sm font-semibold text-tc-text">
            Source health
          </h2>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            Latest ingestion run, source links, pending jobs, and quarantine pressure.
          </p>
        </div>
        <ProductStatusBadge
          label={titleize(health.latest_run_status || "none")}
          tone={runStatusTone(health.latest_run_status || "none")}
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Latest run</dt>
          <dd className="mt-2 break-all font-mono text-[13px] text-tc-text">{latestRunLabel}</dd>
        </div>
        <div className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
          <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Last success</dt>
          <dd className="mt-2 text-[13px] text-tc-text">{formatDateTime(health.last_successful_run_at)}</dd>
        </div>
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">
              {stat.label}
            </dt>
            <dd className="mt-2 text-xl font-semibold text-tc-text">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Latest error</p>
        <p className="mt-2 break-words text-[13px] text-tc-text-muted">{latestError}</p>
      </div>
    </ProductPanel>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ZA").format(value);
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "No successful run recorded";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
