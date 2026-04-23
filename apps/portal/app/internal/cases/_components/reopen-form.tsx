"use client";

import { useState } from "react";
import { reopenCaseAction } from "../actions";

export function ReopenForm({ caseId, actorId }: { caseId: string; actorId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await reopenCaseAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reopen");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-base font-semibold text-gray-900">Reopen Case</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Note</label>
        <textarea
          name="note"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Reopen
      </button>
    </form>
  );
}
