import Link from "next/link";
import { listAnalysts } from "../api";
import { CaseIntakeForm } from "../_components/case-intake-form";

export default async function NewCasePage() {
  const analysts = await listAnalysts();
  const defaultActorId = analysts[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <Link
          href="/internal/cases"
          className="text-[13px] text-muted hover:text-foreground transition-colors duration-200"
        >
          &larr; Back to queue
        </Link>
        <h1 className="mt-3 text-[24px] font-bold tracking-[-0.02em] text-foreground">New Case</h1>
      </div>

      <div className="border border-border rounded-xl bg-card/30 p-6">
        <CaseIntakeForm analysts={analysts} defaultActorId={defaultActorId} />
      </div>
    </div>
  );
}
