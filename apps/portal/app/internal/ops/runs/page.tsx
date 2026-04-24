import { listRuns } from "./api";
import { RunList } from "./_components/run-list";
import { StartProjectionButton } from "./_components/start-projection-button";

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

      <RunList runs={runs} />
    </div>
  );
}