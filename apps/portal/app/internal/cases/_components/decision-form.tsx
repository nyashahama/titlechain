"use client";

import { useState } from "react";
import { Analyst, ReasonCode } from "../types";
import { reassignCaseAction, recordDecisionAction, closeUnresolvedAction } from "../actions";

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
    <form action={handleSubmit} className="flex items-end gap-2">
      <input type="hidden" name="actor_id" value={actorId} />
      <div>
        <label className="block text-xs font-medium text-gray-700">Assign to</label>
        <select
          name="assignee_id"
          required
          className="mt-1 block rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
        >
          {analysts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.display_name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Reassign
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

export function RecordDecisionForm({
  caseId,
  reasonCodes,
  actorId,
}: {
  caseId: string;
  reasonCodes: ReasonCode[];
  actorId: string;
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
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-base font-semibold text-gray-900">Record Decision</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Decision</label>
        <select
          name="decision"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          className="mt-1 block rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
        >
          <option value="clear">Clear</option>
          <option value="review">Review</option>
          <option value="stop">Stop</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reason Codes</label>
        <div className="mt-1 space-y-1">
          {filteredCodes.map((rc) => (
            <label key={rc.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="reason_codes"
                value={rc.code}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {rc.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <textarea
          name="note"
          required
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Record Decision
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
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-base font-semibold text-gray-900">Close Unresolved</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reason Codes</label>
        <div className="mt-1 space-y-1">
          {unresolvedCodes.map((rc) => (
            <label key={rc.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="reason_codes"
                value={rc.code}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {rc.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <textarea
          name="note"
          required
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Close Unresolved
      </button>
    </form>
  );
}
