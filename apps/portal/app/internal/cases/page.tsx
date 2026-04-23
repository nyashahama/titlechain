import Link from "next/link";
import { listCases, listAnalysts } from "./api";
import { CaseQueue } from "./_components/case-queue";
import { ClientAnalystSwitcher } from "./_components/client-analyst-switcher";

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
      <CaseQueue cases={cases} analystMap={analystMap} />
    </div>
  );
}
