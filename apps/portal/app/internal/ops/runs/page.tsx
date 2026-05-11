import { listRuns } from "./api";
import { RunList } from "./_components/run-list";
import { StartProjectionButton } from "./_components/start-projection-button";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPanel } from "@/app/_components/product/ProductPanel";

export default async function RunsPage() {
  const runs = await listRuns();
  const pending = runs.filter((run) => run.status === "pending").length;
  const failed = runs.filter((run) => run.status === "failed").length;
  const completed = runs.filter((run) => run.status === "completed").length;

  return (
    <ProductPage>
      <PageHeader
        eyebrow="Operations"
        title="Runs"
        description="Monitor background projection and property sync runs."
        action={<StartProjectionButton />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RunMetric label="Total Runs" value={runs.length} />
        <RunMetric label="Pending" value={pending} />
        <RunMetric label="Completed" value={completed} />
        <RunMetric label="Failed" value={failed} />
      </div>

      <RunList runs={runs} />
    </ProductPage>
  );
}

function RunMetric({ label, value }: { label: string; value: number }) {
  return (
    <ProductPanel className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-tc-text">{value}</p>
    </ProductPanel>
  );
}
