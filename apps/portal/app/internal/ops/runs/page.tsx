import { listRuns } from "./api";
import { RunList } from "./_components/run-list";
import { StartProjectionButton } from "./_components/start-projection-button";
import { MetricCard } from "@/app/_components/metric-card";

export default async function RunsPage() {
  const runs = await listRuns();

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Runs</h1>
            <p className="text-[13px] text-muted mt-1">Monitor background projection and sync runs</p>
          </div>
          <StartProjectionButton />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Runs" value={runs.length} />
        <MetricCard label="Success Rate" value="94%" delta="+2%" deltaPositive />
        <MetricCard label="Avg Duration" value="1.2m" />
        <MetricCard label="Pending" value={runs.filter((r) => r.status === "pending").length} />
      </div>

      <RunList runs={runs} />
    </div>
  );
}