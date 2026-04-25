import Link from "next/link";
import { getCase, listAnalysts, listReasonCodes } from "../api";
import { CaseDetail } from "../_components/case-detail";
import { RecordDecisionForm, CloseUnresolvedForm } from "../_components/decision-form";
import { EvidenceForm } from "../_components/evidence-form";
import { PartyForm } from "../_components/party-form";
import { ReopenForm } from "../_components/reopen-form";
import { CaseDetailAnalystSwitcher } from "../_components/case-detail-analyst-switcher";
import { DecisionProposalCard } from "../_components/decision-proposal-card";

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

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10 animate-slide-in">
      {/* Top Bar */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/internal/cases"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-200 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to cases
        </Link>
        <CaseDetailAnalystSwitcher analysts={analysts} selected={actorId} caseId={caseId} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-border">
        {["overview", "evidence", "parties", "timeline", "activity"].map((t) => (
          <Link
            key={t}
            href={`/internal/cases/${caseId}?tab=${t}`}
            className={`px-4 py-2.5 text-[13px] font-medium capitalize transition-colors duration-200 border-b-2 ${
              tab === t
                ? "text-foreground border-foreground"
                : "text-muted border-transparent hover:text-foreground hover:border-border"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Main Content */}
        <div>
          <CaseDetail detail={detail} analysts={analysts} actorId={actorId} analystMap={analystMap} activeTab={tab} />
        </div>

        {/* Sticky Sidebar Actions */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {isOpen && (
            <>
              {detail.current_proposal && (
                <DecisionProposalCard caseId={caseId} proposal={detail.current_proposal} actorId={actorId} />
              )}
              <div className="border border-border rounded-2xl bg-card/20 p-5">
                <RecordDecisionForm
                  caseId={caseId}
                  reasonCodes={reasonCodes}
                  actorId={actorId}
                  mode={detail.current_proposal ? "override" : "record"}
                />
              </div>
              <div className="border border-border rounded-2xl bg-card/20 p-5">
                <EvidenceForm caseId={caseId} actorId={actorId} />
              </div>
              <div className="border border-border rounded-2xl bg-card/20 p-5">
                <PartyForm caseId={caseId} actorId={actorId} />
              </div>
              <div className="border border-border rounded-2xl bg-card/20 p-5">
                <CloseUnresolvedForm caseId={caseId} reasonCodes={reasonCodes} actorId={actorId} />
              </div>
            </>
          )}

          {!isOpen && (
            <div className="border border-border rounded-2xl bg-card/20 p-5">
              <ReopenForm caseId={caseId} actorId={actorId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
