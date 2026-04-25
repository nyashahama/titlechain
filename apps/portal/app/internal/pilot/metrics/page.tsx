import { MetricsPanel } from "./metrics-panel";

export default function PilotMetricsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      <div className="mb-10">
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Pilot Metrics</h1>
        <p className="text-[13px] text-muted mt-1">Operational analytics for the pilot program</p>
      </div>
      <MetricsPanel />
    </div>
  );
}
