import Link from "next/link";

import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";

import { caseStatusTone, formatDuration, titleize } from "../_lib/analytics-format";
import type { AnalyticsRiskQueueItem } from "../types";

export function RiskQueue({ items }: { items: AnalyticsRiskQueueItem[] }) {
  return (
    <ProductPanel aria-labelledby="risk-queue-title" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="risk-queue-title" className="text-sm font-semibold text-tc-text">
            Risk queue
          </h2>
          <p className="mt-1 text-[13px] text-tc-text-muted">
            Aged or risky cases that need direct analyst follow-up.
          </p>
        </div>
        <span className="w-fit rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-[12px] text-tc-text-muted">
          {items.length} case{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <caption className="sr-only">Risk queue cases for the selected analytics range</caption>
          <thead className="border-b border-tc-border text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
            <tr>
              <th scope="col" className="pb-2 pr-3 font-medium">Case</th>
              <th scope="col" className="px-3 pb-2 font-medium">Organization</th>
              <th scope="col" className="px-3 pb-2 font-medium">Status</th>
              <th scope="col" className="px-3 pb-2 font-medium">Age</th>
              <th scope="col" className="px-3 pb-2 font-medium">Risk reasons</th>
              <th scope="col" className="pl-3 pb-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tc-border">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-sm text-tc-text-muted">
                  No high-risk cases are queued for this range.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.case_id}>
                  <th scope="row" className="py-3 pr-3 font-medium text-tc-text">
                    <Link
                      href={`/internal/cases/${item.case_id}`}
                      className="font-mono hover:text-tc-info"
                      aria-label={`Open ${item.case_reference}`}
                    >
                      {item.case_reference}
                    </Link>
                  </th>
                  <td className="px-3 py-3 text-tc-text-muted">{item.organization_name || "No organization"}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ProductStatusBadge label={titleize(item.status)} tone={caseStatusTone(item.status)} />
                      <span className="text-[12px] text-tc-text-faint">{titleize(item.customer_status)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-tc-text-muted">{formatDuration(item.age_seconds)}</td>
                  <td className="px-3 py-3 text-tc-text-muted">{formatReasons(item.risk_reasons)}</td>
                  <td className="pl-3 py-3">
                    <Link
                      href={`/internal/cases/${item.case_id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-tc-border bg-tc-surface-subtle px-3 text-[12px] font-medium text-tc-text transition-colors hover:bg-white/[0.05]"
                      aria-label={`Open case detail for ${item.case_reference}`}
                    >
                      Open case
                    </Link>
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

function formatReasons(reasons: string[]): string {
  if (reasons.length === 0) {
    return "No risk reasons recorded";
  }

  return reasons.map((reason) => riskReasonLabel(reason)).join(", ");
}

function riskReasonLabel(reason: string): string {
  if (reason === "evidence_exception_approved") {
    return "Evidence exception approved";
  }
  return titleize(reason);
}
