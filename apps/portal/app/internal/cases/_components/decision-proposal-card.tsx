"use client";

import { useMemo, useState } from "react";

import { acceptProposalAction, reevaluateCaseAction } from "../actions";
import { DecisionProposal } from "../types";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { getDecisionMeta } from "@/app/_lib/product/status";

export function DecisionProposalCard({
  caseId,
  proposal,
  actorId,
}: {
  caseId: string;
  proposal: DecisionProposal;
  actorId: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const explanationReasons = useMemo(() => {
    const explanation = proposal.explanation as { reasons?: Array<{ code?: string; message?: string }> };
    if (!Array.isArray(explanation?.reasons)) {
      return [];
    }
    return explanation.reasons.filter(Boolean);
  }, [proposal.explanation]);
  const decision = getDecisionMeta(proposal.decision);

  async function handleAccept(formData: FormData) {
    setError(null);
    try {
      await acceptProposalAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept recommendation");
    }
  }

  async function handleReevaluate(formData: FormData) {
    setError(null);
    try {
      await reevaluateCaseAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-run evaluation");
    }
  }

  return (
    <ProductPanel className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">Decision Recommendation</h3>
          <p className="text-[13px] text-muted mt-1">{proposal.engine_version}</p>
        </div>
        <ProductStatusBadge label={decision.label} tone={decision.tone} />
      </div>

      <p className="text-[13px] text-foreground/80 leading-relaxed">{proposal.summary}</p>

      {proposal.reason_codes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {proposal.reason_codes.map((rc) => (
            <span
              key={rc.code}
              className="rounded-md border border-tc-border bg-tc-surface-subtle px-2 py-0.5 font-mono text-[10px] text-tc-text-faint"
            >
              {rc.code}
            </span>
          ))}
        </div>
      )}

      {explanationReasons.length > 0 && (
        <div className="space-y-1.5">
          {explanationReasons.map((reason, index) => (
            <p key={`${reason.code ?? "reason"}-${index}`} className="text-[12px] text-muted">
              {reason.message ?? reason.code}
            </p>
          ))}
        </div>
      )}

      {error && <p role="alert" className="text-[12px] text-tc-danger">{error}</p>}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <form action={handleAccept} className="space-y-3">
          <input type="hidden" name="actor_id" value={actorId} />
          <div>
            <label htmlFor="proposal_evidence_exception_note" className="block text-[11px] text-muted mb-1.5">
              Evidence Exception Note
            </label>
            <textarea
              id="proposal_evidence_exception_note"
              name="evidence_exception_note"
              rows={3}
              className="w-full resize-none rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-[13px] text-tc-text transition-colors placeholder:text-tc-text-faint focus:border-tc-accent focus:outline-none"
              placeholder="Required when accepting without confirmed evidence."
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-tc-accent px-4 py-[8px] text-[13px] font-medium text-white transition-opacity duration-200 hover:opacity-85"
          >
            Accept Recommendation
          </button>
        </form>
        <form action={handleReevaluate} className="flex items-end">
          <input type="hidden" name="actor_id" value={actorId} />
          <button
            type="submit"
            className="w-full rounded-md border border-tc-border px-4 py-[8px] text-[13px] font-medium text-tc-text transition-colors duration-200 hover:bg-white/5"
          >
            Re-run Evaluation
          </button>
        </form>
      </div>
    </ProductPanel>
  );
}
