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
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="actor_id" value={actorId} />
      <h3 className="text-base font-semibold text-gray-900">Add Party</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name *</label>
          <input
            name="display_name"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role *</label>
          <select
            name="role"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
          >
            <option value="seller">Seller</option>
            <option value="buyer">Buyer</option>
            <option value="conveyancer">Conveyancer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Entity Type *</label>
          <select
            name="entity_type"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
          >
            <option value="person">Person</option>
            <option value="company">Company</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Identifier</label>
          <input
            name="identifier"
            className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm"
          />
        </div>
      </div>

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
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add Party
      </button>
    </form>
  );
}
