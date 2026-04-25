"use client";

import { useState } from "react";
import { Analyst, ReasonCode } from "../types";
import {
  reassignCaseAction,
  recordDecisionAction,
  closeUnresolvedAction,
} from "../actions";

export function ReassignCaseForm({
  caseId,
  analysts,
  actorId,
}: {
  caseId: string;
  analysts: Analyst[];
  actorId: string;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await reassignCaseAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reassign");
    }
  }

  return (
    <form action={handleSubmit} className="flex items-end gap-3">
      <input type="hidden" name="actor_id" value={actorId} />
      <div>
        <select
          name="assignee_id"
          required
          className="bg-card border border-border-light rounded-lg px-3 py-[6px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
        >
          {analysts.map((a) => (
            <option key={a.id} value={a.id} className="bg-card">
              {a.display_name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-foreground text-background text-[13px] font-medium px-4 py-[7px] rounded-full transition-opacity duration-200 hover:opacity-80"
      >
        Reassign
      </button>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </form>
  );
}

export function RecordDecisionForm({
  caseId,
  reasonCodes,
  actorId,
  mode = "record",
}: {
  caseId: string;
  reasonCodes: ReasonCode[];
  actorId: string;
  mode?: "record" | "override";
}) {
  const [decision, setDecision] = useState<string>("clear");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await recordDecisionAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record decision");
    }
  }

  const filteredCodes = reasonCodes.filter((rc) => {
    if (decision === "clear") return rc.category === "clear_support";
    if (decision === "review")
      return rc.category === "review_trigger" || rc.category === "unresolved_information";
    if (decision === "stop")
      return rc.category === "hard_block" || rc.category === "review_trigger";
    return true;
  });

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">
        {mode === "override" ? "Record Override Decision" : "Record Decision"}
      </h3>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Decision</label>
        <select
          name="decision"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
        >
          <option value="clear" className="bg-card">Clear</option>
          <option value="review" className="bg-card">Review</option>
          <option value="stop" className="bg-card">Stop</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-2">Reason Codes</label>
        <div className="space-y-2">
          {filteredCodes.map((rc) => (
            <label key={rc.code} className="flex items-center gap-2.5 text-[13px] text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                name="reason_codes"
                value={rc.code}
                className="rounded border-border-light bg-card text-foreground focus:ring-0 focus:ring-offset-0"
              />
              <span>{rc.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Note</label>
        <textarea
          name="note"
          required
          rows={3}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
      >
        {mode === "override" ? "Record Override" : "Record Decision"}
      </button>
    </form>
  );
}

export function CloseUnresolvedForm({
  caseId,
  reasonCodes,
  actorId,
}: {
  caseId: string;
  reasonCodes: ReasonCode[];
  actorId: string;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await closeUnresolvedAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close");
    }
  }

  const unresolvedCodes = reasonCodes.filter(
    (rc) => rc.category === "unresolved_information"
  );

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">Close Unresolved</h3>

      <div>
        <label className="block text-[11px] text-muted mb-2">Reason Codes</label>
        <div className="space-y-2">
          {unresolvedCodes.map((rc) => (
            <label key={rc.code} className="flex items-center gap-2.5 text-[13px] text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                name="reason_codes"
                value={rc.code}
                className="rounded border-border-light bg-card text-foreground focus:ring-0 focus:ring-offset-0"
              />
              <span>{rc.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Note</label>
        <textarea
          name="note"
          required
          rows={3}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full border border-border-light text-[13px] font-medium px-4 py-[8px] rounded-full text-foreground transition-colors duration-200 hover:bg-white/5"
      >
        Close Unresolved
      </button>
    </form>
  );
}
