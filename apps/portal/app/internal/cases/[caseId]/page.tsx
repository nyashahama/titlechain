import Link from "next/link";
import { getCase, listAnalysts, listReasonCodes } from "../api";
import { CaseDetail } from "../_components/case-detail";
import { RecordDecisionForm, CloseUnresolvedForm } from "../_components/decision-form";
import { EvidenceForm } from "../_components/evidence-form";
import { PartyForm } from "../_components/party-form";
import { ReopenForm } from "../_components/reopen-form";
import { CaseDetailAnalystSwitcher } from "../_components/case-detail-analyst-switcher";

export default async function CaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ actor?: string }>;
}) {
  const { caseId } = await params;
  const query = await searchParams;
  const detail = await getCase(caseId);
  const analysts = await listAnalysts();
  const reasonCodes = await listReasonCodes();
  const defaultActorId = analysts[0]?.id ?? "";
  const actorId = query.actor ?? defaultActorId;

  const isOpen =
    detail.case.status === "open" ||
    detail.case.status === "in_review" ||
    detail.case.status === "reopened";

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/internal/cases" className="text-sm text-indigo-600 hover:text-indigo-500">
          &larr; Back to queue
        </Link>
        <CaseDetailAnalystSwitcher
          analysts={analysts}
          selected={actorId}
          caseId={caseId}
        />
      </div>

      <CaseDetail detail={detail} analysts={analysts} actorId={actorId} />

      {isOpen && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <EvidenceForm caseId={caseId} actorId={actorId} />
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <PartyForm caseId={caseId} actorId={actorId} />
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <RecordDecisionForm
              caseId={caseId}
              reasonCodes={reasonCodes}
              actorId={actorId}
            />
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <CloseUnresolvedForm
              caseId={caseId}
              reasonCodes={reasonCodes}
              actorId={actorId}
            />
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4">
          <ReopenForm caseId={caseId} actorId={actorId} />
        </div>
      )}
    </div>
  );
}
