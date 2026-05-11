import Link from "next/link";
import { ListChecks, Plus } from "lucide-react";
import { listCases, listAnalysts } from "./api";
import { CaseQueue } from "./_components/case-queue";
import { ClientAnalystSwitcher } from "./_components/client-analyst-switcher";
import { CasesKeyboardShortcuts } from "./_components/cases-keyboard-shortcuts";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { StateView } from "@/app/_components/product/StateView";
import { cn } from "@/app/_lib/cn";

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
    <ProductPage>
      <CasesKeyboardShortcuts />
      <PageHeader
        eyebrow="Operations"
        title="Cases"
        description="Review title verification work, analyst ownership, pilot context, and decision status."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <ClientAnalystSwitcher analysts={analysts} defaultSelected={selectedAnalyst} />
            <Link
              href="/internal/cases/new"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-tc-accent px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
            >
              <Plus className="size-4" />
              New Case
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Case status">
          {statusLinks.map((sl) => {
            const isActive = currentStatus === sl.value;
            return (
              <Link
                key={sl.label}
                href={sl.value ? `/internal/cases?status=${sl.value}` : "/internal/cases"}
                className={cn(
                  "rounded-md border px-3 py-[6px] text-[12px] font-medium transition-colors",
                  isActive
                    ? "border-tc-accent bg-tc-accent text-white"
                    : "border-tc-border bg-tc-surface-subtle text-tc-text-muted hover:border-tc-border-strong hover:text-tc-text"
                )}
              >
                {sl.label}
              </Link>
            );
          })}
        </div>

        {cases.length === 0 ? (
          <StateView
            kind="empty"
            title="No cases found"
            description="Create a new case to start a review queue."
            className="rounded-lg border border-tc-border bg-tc-surface"
            action={
              <Link
                href="/internal/cases/new"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-tc-border bg-tc-surface-subtle px-3 text-[13px] font-medium text-tc-text hover:bg-white/[0.05]"
              >
                <ListChecks className="size-4" />
                New Case
              </Link>
            }
          />
        ) : (
          <CaseQueue cases={cases} analystMap={analystMap} />
        )}
      </div>
    </ProductPage>
  );
}
