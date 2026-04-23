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
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">Reopen Case</h3>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Note</label>
        <textarea
          name="note"
          rows={2}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full border border-border-light text-[13px] font-medium px-4 py-[8px] rounded-full text-foreground transition-colors duration-200 hover:bg-white/5"
      >
        Reopen
      </button>
    </form>
  );
}
