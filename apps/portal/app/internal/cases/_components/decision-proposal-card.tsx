"use client";

import { useMemo, useState } from "react";

import { acceptProposalAction, reevaluateCaseAction } from "../actions";
import { DecisionProposal } from "../types";

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
    <div className="border border-border rounded-2xl bg-card/20 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">Decision Recommendation</h3>
          <p className="text-[13px] text-muted mt-1">{proposal.engine_version}</p>
        </div>
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{
            color: proposal.decision === "clear" ? "#4ade80" : proposal.decision === "stop" ? "#ef4444" : "#fbbf24",
          }}
        >
          {proposal.decision}
        </span>
      </div>

      <p className="text-[13px] text-foreground/80 leading-relaxed">{proposal.summary}</p>

      {proposal.reason_codes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {proposal.reason_codes.map((rc) => (
            <span
              key={rc.code}
              className="px-2 py-0.5 rounded-md text-[10px] border border-border-light text-muted-more font-mono"
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

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <div className="flex gap-2">
        <form action={handleAccept} className="flex-1">
          <input type="hidden" name="actor_id" value={actorId} />
          <button
            type="submit"
            className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            Accept Recommendation
          </button>
        </form>
        <form action={handleReevaluate}>
          <input type="hidden" name="actor_id" value={actorId} />
          <button
            type="submit"
            className="border border-border-light text-[13px] font-medium px-4 py-[8px] rounded-full text-foreground transition-colors duration-200 hover:bg-white/5"
          >
            Re-run Evaluation
          </button>
        </form>
      </div>
    </div>
  );
}
