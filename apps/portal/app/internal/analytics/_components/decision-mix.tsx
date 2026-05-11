import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

import { decisionTone, formatPercent, titleize } from "../_lib/analytics-format";
import type { AnalyticsDecisionMetric } from "../types";

export function DecisionMix({ metrics }: { metrics: AnalyticsDecisionMetric[] }) {
  const total = metrics.reduce((sum, metric) => sum + metric.count, 0);

  return (
    <ProductPanel aria-labelledby="decision-intelligence-title" className="space-y-4">
      <div>
        <h2 id="decision-intelligence-title" className="text-sm font-semibold text-tc-text">
          Decision intelligence
        </h2>
        <p className="mt-1 text-[13px] text-tc-text-muted">
          Clear, review, and stop outcomes with manual handling signals.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[13px]">
          <caption className="sr-only">Decision outcome mix for the selected analytics range</caption>
          <thead className="border-b border-tc-border text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
            <tr>
              <th scope="col" className="pb-2 pr-3 font-medium">Decision</th>
              <th scope="col" className="px-3 pb-2 font-medium">Cases</th>
              <th scope="col" className="px-3 pb-2 font-medium">Accepted</th>
              <th scope="col" className="px-3 pb-2 font-medium">Manual</th>
              <th scope="col" className="pl-3 pb-2 font-medium">Overrides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tc-border">
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-tc-text-muted">
                  No decision outcomes were recorded for this range.
                </td>
              </tr>
            ) : (
              metrics.map((metric) => (
                <tr key={metric.decision}>
                  <th scope="row" className="py-3 pr-3 font-medium text-tc-text">
                    <ProductStatusBadge label={titleize(metric.decision)} tone={decisionTone(metric.decision)} />
                  </th>
                  <td className="px-3 py-3 text-tc-text">
                    <div className="flex items-center gap-3">
                      <span className="w-10 tabular-nums">{formatNumber(metric.count)}</span>
                      <div className="h-1.5 min-w-20 flex-1 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-tc-info"
                          style={{ width: formatPercent(metric.count, total) }}
                        />
                      </div>
                      <span className="w-10 text-right text-[12px] tabular-nums text-tc-text-muted">
                        {formatPercent(metric.count, total)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-tc-text-muted">
                    {formatNumber(metric.accepted_proposal_count)}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-tc-text-muted">
                    {formatNumber(metric.manual_count)}
                  </td>
                  <td className="pl-3 py-3 tabular-nums text-tc-text-muted">
                    {formatNumber(metric.manual_override_count)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ProductPanel>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ZA").format(value);
}
