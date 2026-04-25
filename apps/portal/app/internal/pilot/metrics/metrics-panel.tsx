"use client";

import { useEffect, useState } from "react";

type MetricsData = {
  submitted_count: number;
  resolved_count: number;
  reopened_count: number;
  in_review_count: number;
  unresolved_count: number;
  average_seconds_to_resolve: number;
  oldest_in_review_seconds: number;
  accepted_proposal_count: number;
  manual_override_count: number;
};

function formatDuration(seconds: number): string {
  if (seconds === 0) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function MetricCard({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="border border-border rounded-2xl bg-card/20 p-5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-2">{label}</p>
      <p className="text-[28px] font-bold tracking-[-0.03em] text-foreground">{value}</p>
      {subtitle && <p className="text-[12px] text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/internal/pilot/metrics")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setMetrics)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <svg className="animate-spin h-6 w-6 text-muted" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!metrics) {
    return <p className="text-muted">No metrics available</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard label="Submitted" value={metrics.submitted_count} />
      <MetricCard label="Resolved" value={metrics.resolved_count} />
      <MetricCard label="In Review" value={metrics.in_review_count} />
      <MetricCard label="Unresolved" value={metrics.unresolved_count} />
      <MetricCard label="Reopened" value={metrics.reopened_count} />
      <MetricCard label="Avg. Time to Resolve" value={formatDuration(metrics.average_seconds_to_resolve)} />
      <MetricCard label="Oldest In Review" value={formatDuration(metrics.oldest_in_review_seconds)} />
      <MetricCard label="Accepted Proposals" value={metrics.accepted_proposal_count} subtitle="Auto-accepted" />
      <MetricCard label="Manual Overrides" value={metrics.manual_override_count} subtitle="Analyst overrides" />
    </div>
  );
}
