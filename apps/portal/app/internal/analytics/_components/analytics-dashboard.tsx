import { DecisionMix } from "./decision-mix";
import { EvidenceCoverage } from "./evidence-coverage";
import { MetricGrid } from "./metric-grid";
import { RangeSwitcher } from "./range-switcher";
import { ReasonIntelligence } from "./reason-intelligence";
import { RiskQueue } from "./risk-queue";
import { SourceHealth } from "./source-health";
import type { AnalyticsOverview, AnalyticsRangeKey } from "../types";

export function AnalyticsDashboard({
  overview,
  selectedRange,
}: {
  overview: AnalyticsOverview;
  selectedRange: AnalyticsRangeKey;
}) {
  return (
    <div className="space-y-4">
      <RangeSwitcher selectedRange={selectedRange} range={overview.range} />
      <MetricGrid summary={overview.operating_summary} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DecisionMix metrics={overview.decision_mix} />
        <ReasonIntelligence metrics={overview.reason_codes} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <EvidenceCoverage evidence={overview.evidence} />
        <SourceHealth health={overview.source_health} />
      </div>

      <RiskQueue items={overview.risk_queue} />
    </div>
  );
}
