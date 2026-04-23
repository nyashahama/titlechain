"use client";

import { useState } from "react";
import { addEvidenceAction } from "../actions";

export function EvidenceForm({ caseId, actorId }: { caseId: string; actorId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await addEvidenceAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add evidence");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-base font-semibold text-gray-900">Add Evidence</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Evidence Type</label>
          <input
            name="evidence_type"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Source Type</label>
          <input
            name="source_type"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Source Reference</label>
        <input
          name="source_reference"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">External Reference</label>
        <input
          name="external_reference"
          className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Excerpt</label>
        <textarea
          name="excerpt"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Extracted Facts (JSON)</label>
        <textarea
          name="extracted_facts"
          rows={2}
          placeholder='{"key": "value"}'
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="evidence_status"
          required
          className="mt-1 block rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
        >
          <option value="captured">Captured</option>
          <option value="confirmed">Confirmed</option>
          <option value="conflicting">Conflicting</option>
          <option value="superseded">Superseded</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Analyst Note</label>
        <textarea
          name="analyst_note"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add Evidence
      </button>
    </form>
  );
}
