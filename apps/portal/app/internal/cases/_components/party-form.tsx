"use client";

import { useState } from "react";
import { addPartyAction } from "../actions";

export function PartyForm({ caseId, actorId }: { caseId: string; actorId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    try {
      await addPartyAction(caseId, formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add party");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">Add Party</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Display Name *</label>
          <input
            name="display_name"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Role *</label>
          <select
            name="role"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
          >
            <option value="seller" className="bg-card">Seller</option>
            <option value="buyer" className="bg-card">Buyer</option>
            <option value="conveyancer" className="bg-card">Conveyancer</option>
            <option value="other" className="bg-card">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Entity Type *</label>
          <select
            name="entity_type"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
          >
            <option value="person" className="bg-card">Person</option>
            <option value="company" className="bg-card">Company</option>
            <option value="unknown" className="bg-card">Unknown</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-muted mb-1.5">Identifier</label>
          <input
            name="identifier"
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
      </div>

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
        className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
      >
        Add Party
      </button>
    </form>
  );
}
