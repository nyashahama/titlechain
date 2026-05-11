import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCase, listAnalysts, listReasonCodes } from "../api";
import { CaseDetail } from "../_components/case-detail";
import { RecordDecisionForm, CloseUnresolvedForm } from "../_components/decision-form";
import { EvidenceForm } from "../_components/evidence-form";
import { PartyForm } from "../_components/party-form";
import { ReopenForm } from "../_components/reopen-form";
import { CaseDetailAnalystSwitcher } from "../_components/case-detail-analyst-switcher";
import { DecisionProposalCard } from "../_components/decision-proposal-card";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { cn } from "@/app/_lib/cn";

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ actor?: string; tab?: string }>;
}) {
  const { caseId } = await params;
  const query = await searchParams;
  const tab = query.tab ?? "overview";
  const detail = await getCase(caseId);
  const analysts = await listAnalysts();
  const reasonCodes = await listReasonCodes();
  const analystMap = new Map(analysts.map((a) => [a.id, a.display_name]));
  const defaultActorId = analysts[0]?.id ?? "";
  const actorId = query.actor ?? defaultActorId;

  const isOpen =
    detail.case.status === "open" ||
    detail.case.status === "in_review" ||
    detail.case.status === "reopened";
  const tabs = ["overview", "evidence", "parties", "timeline", "activity"];

  return (
    <ProductPage>
      <PageHeader
        eyebrow="Operations / Cases"
        title={detail.case.case_reference}
        description="Review the property record, evidence, parties, decisions, and audit activity."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/internal/cases"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-tc-border bg-tc-surface px-3 text-[13px] font-medium text-tc-text transition-colors hover:bg-white/[0.05]"
            >
              <ArrowLeft className="size-4" />
              Back to cases
            </Link>
            <CaseDetailAnalystSwitcher analysts={analysts} selected={actorId} caseId={caseId} />
          </div>
        }
      />

      <nav className="flex flex-wrap gap-2 border-b border-tc-border pb-4" aria-label="Case sections">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/internal/cases/${caseId}?tab=${t}`}
            className={cn(
              "rounded-md border px-3 py-2 text-[13px] font-medium capitalize transition-colors",
              tab === t
                ? "border-tc-accent bg-tc-accent text-white"
                : "border-tc-border bg-tc-surface-subtle text-tc-text-muted hover:border-tc-border-strong hover:text-tc-text"
            )}
          >
            {t}
          </Link>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div>
          <CaseDetail detail={detail} analysts={analysts} actorId={actorId} analystMap={analystMap} activeTab={tab} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          {isOpen && (
            <>
              {detail.current_proposal && (
                <DecisionProposalCard caseId={caseId} proposal={detail.current_proposal} actorId={actorId} />
              )}
              <ProductPanel>
                <RecordDecisionForm
                  caseId={caseId}
                  reasonCodes={reasonCodes}
                  actorId={actorId}
                  mode={detail.current_proposal ? "override" : "record"}
                />
              </ProductPanel>
              <ProductPanel>
                <EvidenceForm caseId={caseId} actorId={actorId} />
              </ProductPanel>
              <ProductPanel>
                <PartyForm caseId={caseId} actorId={actorId} />
              </ProductPanel>
              <ProductPanel>
                <CloseUnresolvedForm caseId={caseId} reasonCodes={reasonCodes} actorId={actorId} />
              </ProductPanel>
            </>
          )}

          {!isOpen && (
            <ProductPanel>
              <ReopenForm caseId={caseId} actorId={actorId} />
            </ProductPanel>
          )}
        </aside>
      </div>
    </ProductPage>
  );
}
