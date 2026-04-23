import Link from "next/link";
import { listCases, listAnalysts } from "./api";
import { CaseQueue } from "./_components/case-queue";
import { AnalystSwitcher } from "./_components/analyst-switcher";

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
  const selectedAnalyst = params.analyst ?? analysts[0]?.id ?? "";

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Case Queue</h1>
        <div className="flex items-center gap-4">
          <AnalystSwitcher analysts={analysts} selected={selectedAnalyst} onChange={() => {}} />
          <Link
            href="/internal/cases/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Case
          </Link>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Link
          href="/internal/cases"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          All
        </Link>
        <Link
          href="/internal/cases?status=open"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          Open
        </Link>
        <Link
          href="/internal/cases?status=in_review"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          In Review
        </Link>
        <Link
          href="/internal/cases?status=resolved"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          Resolved
        </Link>
        <Link
          href="/internal/cases?status=closed_unresolved"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          Unresolved
        </Link>
        <Link
          href="/internal/cases?status=reopened"
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          Reopened
        </Link>
      </div>

      <CaseQueue cases={cases} />
    </div>
  );
}
