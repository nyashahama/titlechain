import { ProductPanel } from "@/app/_components/product/ProductPanel";

import { formatPercent, titleize } from "../_lib/analytics-format";
import type { AnalyticsReasonCodeMetric } from "../types";

export function ReasonIntelligence({ metrics }: { metrics: AnalyticsReasonCodeMetric[] }) {
  const maxCount = Math.max(...metrics.map((metric) => metric.count), 0);

  return (
    <ProductPanel aria-labelledby="reason-intelligence-title" className="space-y-4">
      <div>
        <h2 id="reason-intelligence-title" className="text-sm font-semibold text-tc-text">
          Reason intelligence
        </h2>
        <p className="mt-1 text-[13px] text-tc-text-muted">
          Leading review and decision drivers from recorded reason codes.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <caption className="sr-only">Reason code frequency for the selected analytics range</caption>
          <thead className="border-b border-tc-border text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
            <tr>
              <th scope="col" className="pb-2 pr-3 font-medium">Reason</th>
              <th scope="col" className="px-3 pb-2 font-medium">Category</th>
              <th scope="col" className="pl-3 pb-2 font-medium">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tc-border">
            {metrics.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-sm text-tc-text-muted">
                  No reason codes were recorded for this range.
                </td>
              </tr>
            ) : (
              metrics.map((metric) => (
                <tr key={metric.code}>
                  <th scope="row" className="py-3 pr-3 font-medium text-tc-text">
                    <span className="block">{metric.label}</span>
                    <span className="mt-1 block font-mono text-[11px] font-normal text-tc-text-faint">
                      {metric.code}
                    </span>
                  </th>
                  <td className="px-3 py-3 text-tc-text-muted">{titleize(metric.category)}</td>
                  <td className="pl-3 py-3 text-tc-text">
                    <div className="flex items-center gap-3">
                      <span className="w-10 tabular-nums">{formatNumber(metric.count)}</span>
                      <div className="h-1.5 min-w-24 flex-1 rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-tc-warning"
                          style={{ width: formatPercent(metric.count, maxCount) }}
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
    </ProductPanel>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ZA").format(value);
}
