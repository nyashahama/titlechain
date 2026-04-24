"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addEvidenceAction } from "../actions";

export function EvidenceForm({ caseId, actorId }: { caseId: string; actorId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await addEvidenceAction(caseId, formData);
      toast.success("Evidence added");
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add evidence";
      toast.error("Failed to add evidence", { description: message });
      setError(message);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">Add Evidence</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Evidence Type</label>
          <input
            name="evidence_type"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Source Type</label>
          <input
            name="source_type"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Source Reference</label>
        <input
          name="source_reference"
          required
          className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">External Reference</label>
        <input
          name="external_reference"
          className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Excerpt</label>
        <textarea
          name="excerpt"
          rows={2}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
        />
      </div>

      <div>
        <label className="block text-[11px] text-muted mb-1.5">Extracted Facts (JSON)</label>
        <textarea
          name="extracted_facts"
          rows={2}
          placeholder='{"key": "value"}'
          className="w-full bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Status</label>
          <select
            name="evidence_status"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
          >
            <option value="captured" className="bg-card">Captured</option>
            <option value="confirmed" className="bg-card">Confirmed</option>
            <option value="conflicting" className="bg-card">Conflicting</option>
            <option value="superseded" className="bg-card">Superseded</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Analyst Note</label>
          <input
            name="analyst_note"
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-[12px] text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
      >
        Add Evidence
      </button>
    </form>
  );
}
