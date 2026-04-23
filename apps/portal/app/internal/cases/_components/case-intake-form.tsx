"use client";

import { useState } from "react";
import { createCaseAction } from "../actions";
import { useRouter } from "next/navigation";
import { Analyst } from "../types";

export function CaseIntakeForm({ analysts, defaultActorId }: { analysts: Analyst[]; defaultActorId: string }) {
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
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="actor_id" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
          Creating Analyst
        </label>
        <select
          id="actor_id"
          name="actor_id"
          required
          defaultValue={defaultActorId}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
        >
          {analysts.map((a) => (
            <option key={a.id} value={a.id} className="bg-card">
              {a.display_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="property_description" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
          Property Description *
        </label>
        <input
          id="property_description"
          name="property_description"
          required
          className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="locality_or_area" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
            Locality / Area *
          </label>
          <input
            id="locality_or_area"
            name="locality_or_area"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="municipality_or_deeds_office" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
            Municipality / Deeds Office *
          </label>
          <input
            id="municipality_or_deeds_office"
            name="municipality_or_deeds_office"
            required
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="title_reference" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
            Title Reference
          </label>
          <input
            id="title_reference"
            name="title_reference"
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="matter_reference" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
            Matter Reference
          </label>
          <input
            id="matter_reference"
            name="matter_reference"
            className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="intake_note" className="block text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">
          Intake Note
        </label>
        <textarea
          id="intake_note"
          name="intake_note"
          rows={3}
          className="w-full bg-card border border-border-light rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-[13px] text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="bg-foreground text-background text-[14px] font-medium px-6 py-[10px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create Case"}
      </button>
    </form>
  );
}
