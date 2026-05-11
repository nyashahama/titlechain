"use client";

import { useState, type FormEvent } from "react";
import { Loader2, PlayCircle } from "lucide-react";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { DomainIcon } from "@/app/_components/landing/shared/DomainIcons";
import type { CreateMatterRequest } from "../../types";

type NewMatterFormProps = {
  onSubmit: (request: CreateMatterRequest) => Promise<void>;
  loading: boolean;
  error: string;
};

type FieldErrors = Partial<Record<"property" | "locality" | "municipality", string>>;

const verificationSteps = [
  {
    title: "Deeds search",
    description: "Confirm title and registry records.",
    icon: "deeds-search" as const,
  },
  {
    title: "Fraud detection",
    description: "Screen for identity and transfer risk.",
    icon: "fraud-detection" as const,
  },
  {
    title: "Clear-to-lodge decision",
    description: "Return clear, review, or stop with evidence.",
    icon: "clear-to-lodge" as const,
  },
];

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function NewMatterForm({ onSubmit, loading, error }: NewMatterFormProps) {
  const [propertyDescription, setPropertyDescription] = useState("");
  const [locality, setLocality] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [titleReference, setTitleReference] = useState("");
  const [customerReference, setCustomerReference] = useState("");
  const [intakeNote, setIntakeNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const property = propertyDescription.trim();
    const area = locality.trim();
    const deedsOffice = municipality.trim();
    const nextErrors: FieldErrors = {};

    if (!property) nextErrors.property = "Property description is required.";
    if (!area) nextErrors.locality = "Locality or area is required.";
    if (!deedsOffice) nextErrors.municipality = "Municipality or deeds office is required.";

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      property_description: property,
      locality_or_area: area,
      municipality_or_deeds_office: deedsOffice,
      title_reference: optionalValue(titleReference),
      customer_reference: optionalValue(customerReference),
      intake_note: optionalValue(intakeNote),
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <ProductPanel aria-labelledby="new-matter-form-title">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <h2 id="new-matter-form-title" className="text-sm font-medium text-tc-text">
              Matter Intake
            </h2>
            <p className="mt-1 text-[13px] text-tc-text-muted">Capture the property record to run the verification.</p>
          </div>

          <div>
            <label htmlFor="property-description" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
              Property Description *
            </label>
            <input
              id="property-description"
              required
              aria-invalid={fieldErrors.property ? "true" : "false"}
              aria-describedby={fieldErrors.property ? "property-description-error" : undefined}
              value={propertyDescription}
              onChange={(event) => {
                setPropertyDescription(event.target.value);
                clearFieldError("property");
              }}
              className="w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
              placeholder="Erf 412, Rosebank Township"
            />
            {fieldErrors.property ? (
              <p id="property-description-error" className="mt-2 text-[12px] text-tc-danger">
                {fieldErrors.property}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="locality" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
                Locality / Area *
              </label>
              <input
                id="locality"
                required
                aria-invalid={fieldErrors.locality ? "true" : "false"}
                aria-describedby={fieldErrors.locality ? "locality-error" : undefined}
                value={locality}
                onChange={(event) => {
                  setLocality(event.target.value);
                  clearFieldError("locality");
                }}
                className="w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
                placeholder="Rosebank"
              />
              {fieldErrors.locality ? (
                <p id="locality-error" className="mt-2 text-[12px] text-tc-danger">
                  {fieldErrors.locality}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="municipality" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
                Municipality / Deeds Office *
              </label>
              <input
                id="municipality"
                required
                aria-invalid={fieldErrors.municipality ? "true" : "false"}
                aria-describedby={fieldErrors.municipality ? "municipality-error" : undefined}
                value={municipality}
                onChange={(event) => {
                  setMunicipality(event.target.value);
                  clearFieldError("municipality");
                }}
                className="w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
                placeholder="City of Johannesburg"
              />
              {fieldErrors.municipality ? (
                <p id="municipality-error" className="mt-2 text-[12px] text-tc-danger">
                  {fieldErrors.municipality}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="title-reference" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
                Title Reference
              </label>
              <input
                id="title-reference"
                value={titleReference}
                onChange={(event) => setTitleReference(event.target.value)}
                className="w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
                placeholder="T12345/2018"
              />
            </div>

            <div>
              <label htmlFor="matter-reference" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
                Matter Reference
              </label>
              <input
                id="matter-reference"
                value={customerReference}
                onChange={(event) => setCustomerReference(event.target.value)}
                className="w-full rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
                placeholder="M-2026-001"
              />
            </div>
          </div>

          <div>
            <label htmlFor="intake-note" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
              Intake Note
            </label>
            <textarea
              id="intake-note"
              value={intakeNote}
              onChange={(event) => setIntakeNote(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
              placeholder="Optional notes"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-tc-danger/30 bg-tc-danger/10 px-3 py-2 text-[13px] text-tc-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-tc-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <PlayCircle className="size-4" />}
            {loading ? "Running verification..." : "Run Clear-to-Lodge Check"}
          </button>
        </form>
      </ProductPanel>

      <ProductPanel aria-labelledby="verification-path-title" className="space-y-4 lg:sticky lg:top-6">
        <div>
          <h2 id="verification-path-title" className="text-sm font-medium text-tc-text">
            Verification Path
          </h2>
          <p className="mt-1 text-[13px] text-tc-text-muted">Each matter runs through registry, risk, and decision checks.</p>
        </div>
        <div className="space-y-3">
          {verificationSteps.map((step) => (
            <div key={step.title} className="flex gap-3 rounded-md border border-tc-border bg-tc-surface-subtle p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-tc-border bg-tc-surface">
                <DomainIcon name={step.icon} data-testid="verification-step-icon" className="size-5 text-tc-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-tc-text">{step.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-tc-text-muted">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ProductPanel>
    </div>
  );
}
