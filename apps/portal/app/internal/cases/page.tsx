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
  const selectedAnalyst = params.assignee_id ?? "";

  const statusLinks = [
    { label: "All", href: "/internal/cases" },
    { label: "Open", href: "/internal/cases?status=open" },
    { label: "In Review", href: "/internal/cases?status=in_review" },
    { label: "Resolved", href: "/internal/cases?status=resolved" },
    { label: "Unresolved", href: "/internal/cases?status=closed_unresolved" },
    { label: "Reopened", href: "/internal/cases?status=reopened" },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-foreground">Case Queue</h1>
        <div className="flex items-center gap-4">
          <ClientAnalystSwitcher analysts={analysts} defaultSelected={selectedAnalyst} />
          <Link
            href="/internal/cases/new"
            className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            New Case
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {statusLinks.map((sl) => {
          const isActive =
            (sl.href === "/internal/cases" && !params.status) ||
            sl.href === `/internal/cases?status=${params.status}`;
          return (
            <Link
              key={sl.label}
              href={sl.href}
              className={`px-3 py-[5px] rounded-full text-[12px] font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-foreground text-background"
                  : "border border-border-light text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              {sl.label}
            </Link>
          );
        })}
      </div>

      <CaseQueue cases={cases} />
    </div>
  );
}
