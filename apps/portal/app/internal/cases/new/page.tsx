import Link from "next/link";
import { listAnalysts } from "../api";
import { CaseIntakeForm } from "../_components/case-intake-form";

export default async function NewCasePage() {
  const analysts = await listAnalysts();
  const defaultActorId = analysts[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10 animate-slide-in">
      <div className="mb-8">
        <Link
          href="/internal/cases"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-200 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to cases
        </Link>
        <h1 className="mt-4 text-[28px] font-bold tracking-[-0.03em] text-foreground">New Case</h1>
        <p className="text-[13px] text-muted mt-1">Create a new title verification case</p>
      </div>

      <div className="border border-border rounded-2xl bg-card/20 p-6 md:p-8">
        <CaseIntakeForm analysts={analysts} defaultActorId={defaultActorId} />
      </div>
    </div>
  );
}
