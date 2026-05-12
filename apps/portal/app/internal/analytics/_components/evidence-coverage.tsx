import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

import { evidenceTone, formatPercent, titleize } from "../_lib/analytics-format";
import type { AnalyticsEvidence } from "../types";

export function EvidenceCoverage({ evidence }: { evidence: AnalyticsEvidence }) {
  const coverageStats = [
    {
      label: "Evidence items",
      value: formatNumber(evidence.total_items),
    },
    {
      label: "Cases without evidence",
      value: formatNumber(evidence.cases_without_evidence),
    },
    {
      label: "Without confirmed evidence",
      value: formatNumber(evidence.cases_without_confirmed_evidence),
    },
    {
      label: "Exception approved",
      value: formatNumber(evidence.exception_approved_count),
    },
  ];

  return (
    <ProductPanel aria-labelledby="evidence-coverage-title" className="space-y-4">
      <div>
        <h2 id="evidence-coverage-title" className="text-sm font-semibold text-tc-text">
          Evidence coverage
        </h2>
        <p className="mt-1 text-[13px] text-tc-text-muted">
          Confirmation coverage by evidence status and source type.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {coverageStats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-tc-border bg-tc-surface-subtle p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">
              {stat.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-tc-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EvidenceStatusTable evidence={evidence} />
        <EvidenceSourceTable evidence={evidence} />
      </div>
    </ProductPanel>
  );
}

function EvidenceStatusTable({ evidence }: { evidence: AnalyticsEvidence }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-[13px]">
        <caption className="sr-only">Evidence status mix for the selected analytics range</caption>
        <thead className="border-b border-tc-border text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
          <tr>
            <th scope="col" className="pb-2 pr-3 font-medium">Status</th>
            <th scope="col" className="pl-3 pb-2 font-medium">Items</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tc-border">
          {evidence.status_mix.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-6 text-center text-sm text-tc-text-muted">
                No evidence statuses were recorded for this range.
              </td>
            </tr>
          ) : (
            evidence.status_mix.map((metric) => (
              <tr key={metric.status}>
                <th scope="row" className="py-3 pr-3 font-medium text-tc-text">
                  <ProductStatusBadge label={titleize(metric.status)} tone={evidenceTone(metric.status)} />
                </th>
                <td className="pl-3 py-3 text-tc-text">
                  <div className="flex items-center gap-3">
                    <span className="w-10 tabular-nums">{formatNumber(metric.count)}</span>
                    <div className="h-1.5 min-w-20 flex-1 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-tc-success"
                        style={{ width: formatPercent(metric.count, evidence.total_items) }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceSourceTable({ evidence }: { evidence: AnalyticsEvidence }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-[13px]">
        <caption className="sr-only">Evidence source type mix for the selected analytics range</caption>
        <thead className="border-b border-tc-border text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
          <tr>
            <th scope="col" className="pb-2 pr-3 font-medium">Source type</th>
            <th scope="col" className="pl-3 pb-2 font-medium">Items</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tc-border">
          {evidence.source_type_mix.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-6 text-center text-sm text-tc-text-muted">
                No evidence source types were recorded for this range.
              </td>
            </tr>
          ) : (
            evidence.source_type_mix.map((metric) => (
              <tr key={metric.source_type}>
                <th scope="row" className="py-3 pr-3 font-medium text-tc-text">
                  {titleize(metric.source_type)}
                </th>
                <td className="pl-3 py-3 text-tc-text">
                  <div className="flex items-center gap-3">
                    <span className="w-10 tabular-nums">{formatNumber(metric.count)}</span>
                    <div className="h-1.5 min-w-20 flex-1 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-tc-info"
                        style={{ width: formatPercent(metric.count, evidence.total_items) }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ZA").format(value);
}
