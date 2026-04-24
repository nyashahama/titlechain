import Link from "next/link";
import { listCases, listAnalysts } from "./api";
import { CaseQueue } from "./_components/case-queue";
import { ClientAnalystSwitcher } from "./_components/client-analyst-switcher";
import { CasesKeyboardShortcuts } from "./_components/cases-keyboard-shortcuts";
import { EmptyState } from "@/app/_components/ui/empty-state";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; assignee_id?: string; analyst?: string }>;
}) {
  const params = await searchParams;
  const cases = await listCases({
    status: params.status as any,
    assignee_id: params.assignee_id,
  });
  const analysts = await listAnalysts();
  const analystMap = new Map(analysts.map((a) => [a.id, a.display_name]));
  const selectedAnalyst = params.assignee_id ?? "";

  const statusLinks = [
    { label: "All", value: "" },
    { label: "Open", value: "open" },
    { label: "In Review", value: "in_review" },
    { label: "Resolved", value: "resolved" },
    { label: "Unresolved", value: "closed_unresolved" },
    { label: "Reopened", value: "reopened" },
  ];

  const currentStatus = params.status ?? "";

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      <CasesKeyboardShortcuts />
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Cases</h1>
            <p className="text-[13px] text-muted mt-1">Review and manage title verification cases</p>
          </div>
          <div className="flex items-center gap-3">
            <ClientAnalystSwitcher analysts={analysts} defaultSelected={selectedAnalyst} />
            <Link
              href="/internal/cases/new"
              className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
            >
              New Case
            </Link>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {statusLinks.map((sl) => {
            const isActive = currentStatus === sl.value;
            return (
              <Link
                key={sl.label}
                href={sl.value ? `/internal/cases?status=${sl.value}` : "/internal/cases"}
                className={`px-3 py-[5px] rounded-full text-[12px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {sl.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Queue */}
      {cases.length === 0 ? (
        <EmptyState
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No cases found"
          description="Create a new case to get started with your review queue."
          action={
            <Link href="/internal/cases/new" className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80">
              New Case
            </Link>
          }
        />
      ) : (
        <CaseQueue cases={cases} analystMap={analystMap} />
      )}
    </div>
  );
}
