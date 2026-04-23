"use client";

import { useState } from "react";
import { createCaseAction } from "../actions";
import { useRouter } from "next/navigation";

export function CaseIntakeForm({ actorId }: { actorId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    try {
      const detail = await createCaseAction(formData);
      router.push(`/internal/cases/${detail.case.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="actor_id" value={actorId} />

      <div>
        <label htmlFor="property_description" className="block text-sm font-medium text-gray-700">
          Property Description *
        </label>
        <input
          id="property_description"
          name="property_description"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="locality_or_area" className="block text-sm font-medium text-gray-700">
            Locality / Area *
          </label>
          <input
            id="locality_or_area"
            name="locality_or_area"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="municipality_or_deeds_office" className="block text-sm font-medium text-gray-700">
            Municipality / Deeds Office *
          </label>
          <input
            id="municipality_or_deeds_office"
            name="municipality_or_deeds_office"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="title_reference" className="block text-sm font-medium text-gray-700">
            Title Reference
          </label>
          <input
            id="title_reference"
            name="title_reference"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="matter_reference" className="block text-sm font-medium text-gray-700">
            Matter Reference
          </label>
          <input
            id="matter_reference"
            name="matter_reference"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="intake_note" className="block text-sm font-medium text-gray-700">
          Intake Note
        </label>
        <textarea
          id="intake_note"
          name="intake_note"
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create Case"}
      </button>
    </form>
  );
}
