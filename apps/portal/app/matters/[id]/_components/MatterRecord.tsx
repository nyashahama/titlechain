"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSearch,
  Home,
  MapPin,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { CopyAction } from "@/app/_components/product/CopyAction";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { evidenceReadinessAction, evidenceReadinessTone } from "@/app/_lib/product/evidence-readiness";
import { getDecisionMeta, getMatterStatusMeta, type ProductTone } from "@/app/_lib/product/status";
import type { MatterDetail } from "../../types";

type MatterRecordProps = {
  detail: MatterDetail;
  onReopen: (note: string) => Promise<void>;
  reopening: boolean;
  reopenError: string;
};

function formatValue(value: string) {
  return value || "Not provided";
}

function EvidenceStatus({ status }: { status: string }) {
  const toneByStatus: Record<string, ProductTone> = {
    captured: "info",
    confirmed: "success",
    conflicting: "danger",
    superseded: "muted",
    verified: "success",
    failed: "danger",
  };
  const tone = toneByStatus[status] ?? "muted";
  return <ProductStatusBadge label={status.replace(/_/g, " ")} tone={tone} />;
}

export function MatterRecord({ detail, onReopen, reopening, reopenError }: MatterRecordProps) {
  const [reopenNote, setReopenNote] = useState("");
  const matter = detail.summary;
  const evidence = detail.evidence ?? [];
  const reasons = detail.reasons ?? [];
  const timeline = detail.timeline ?? [];
  const readiness = detail.evidence_readiness ?? {
    state: "unknown",
    label: "Unknown",
    description: "Evidence readiness could not be evaluated.",
    confirmed_evidence_count: evidence.filter((item) => item.status === "confirmed" || item.status === "verified").length,
    evidence_count: evidence.length,
    missing: [],
  };
  const decision = getDecisionMeta(matter.decision);
  const status = getMatterStatusMeta(matter.customer_status);

  async function handleReopen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const note = reopenNote.trim();
    if (!note) return;

    try {
      await onReopen(note);
      setReopenNote("");
    } catch {
      // The page owns the visible reopen error state.
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/matters"
        className="inline-flex w-fit items-center gap-2 text-[13px] text-tc-text-muted transition-colors hover:text-tc-text"
      >
        <ArrowLeft className="size-4" />
        Back to matters
      </Link>

      <header className="grid gap-5 border-b border-tc-border pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="mb-2 flex min-w-0 items-center gap-1.5">
            <span className="truncate font-mono text-[11px] text-tc-text-faint tabular-nums">
              {matter.case_reference}
            </span>
            <CopyAction text={matter.case_reference} label={`Copy ${matter.case_reference}`} />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-tc-text md:text-3xl">
            {matter.property_description}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-tc-text-muted">
            <MapPin className="size-4" />
            <span>{matter.locality_or_area}</span>
            <span aria-hidden="true">·</span>
            <span>{matter.municipality_or_deeds_office}</span>
          </p>
          {matter.customer_reference ? (
            <p className="mt-1 text-[12px] text-tc-text-faint">Customer ref: {matter.customer_reference}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ProductStatusBadge label={status.label} tone={status.tone} />
          <ProductStatusBadge label={decision.label} tone={decision.tone} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <main className="flex min-w-0 flex-col gap-6">
          <ProductPanel aria-labelledby="decision-title" className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-tc-border bg-tc-surface-subtle">
                <CheckCircle2 className="size-5 text-tc-text-muted" />
              </div>
              <div className="min-w-0">
                <p id="decision-title" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tc-text-faint">
                  Clear-to-Lodge Decision
                </p>
                <p className="mt-1 text-2xl font-semibold text-tc-text">{decision.label}</p>
                <div className="mt-2">
                  <RelativeTime date={matter.updated_at} />
                </div>
              </div>
            </div>
            <div className="border-t border-tc-border pt-4">
              {reasons.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {reasons.map((reason) => (
                    <div key={reason.code} className="rounded-md border border-tc-border bg-white/[0.02] px-3 py-2">
                      <p className="font-mono text-[11px] text-tc-text-faint">{reason.code}</p>
                      <p className="mt-1 text-[13px] text-tc-text-muted">{reason.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-tc-text-muted">No decision reasons have been published yet.</p>
              )}
            </div>
          </ProductPanel>

          <ProductPanel aria-labelledby="property-title" className="space-y-4">
            <div className="flex items-center gap-2">
              <Home className="size-4 text-tc-text-faint" />
              <h2 id="property-title" className="text-sm font-medium text-tc-text">
                Property Details
              </h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Locality</dt>
                <dd className="mt-1 text-sm text-tc-text">{formatValue(matter.locality_or_area)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Municipality</dt>
                <dd className="mt-1 text-sm text-tc-text">{formatValue(matter.municipality_or_deeds_office)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Title Reference</dt>
                <dd className="mt-1 text-sm text-tc-text">{formatValue(matter.title_reference)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Case Reference</dt>
                <dd className="mt-1 font-mono text-sm text-tc-text">{matter.case_reference}</dd>
              </div>
            </dl>
          </ProductPanel>

          <ProductPanel aria-labelledby="verification-title" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-tc-text-faint" />
                <h2 id="verification-title" className="text-sm font-medium text-tc-text">
                  Verification Basis
                </h2>
              </div>
              <ProductStatusBadge label={readiness.label} tone={evidenceReadinessTone(readiness.state)} />
            </div>
            <div className="rounded-md border border-tc-border bg-white/[0.02] p-4">
              <p className="text-sm leading-6 text-tc-text">{readiness.description}</p>
              <p className="mt-2 text-[13px] leading-6 text-tc-text-muted">{evidenceReadinessAction(readiness.state)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-tc-text-faint">
                <span className="rounded-md border border-tc-border bg-tc-surface-subtle px-2 py-1 font-mono tabular-nums text-tc-text-muted">
                  {readiness.confirmed_evidence_count} / {readiness.evidence_count} confirmed
                </span>
                {readiness.missing?.length ? (
                  <span>Missing {readiness.missing.map((item) => item.replace(/_/g, " ")).join(", ")}</span>
                ) : null}
              </div>
            </div>
          </ProductPanel>

          <ProductPanel aria-labelledby="evidence-title" className="space-y-4">
            <div className="flex items-center gap-2">
              <FileSearch className="size-4 text-tc-text-faint" />
              <h2 id="evidence-title" className="text-sm font-medium text-tc-text">
                Evidence
              </h2>
            </div>
            {evidence.length > 0 ? (
              <div className="divide-y divide-tc-border">
                {evidence.map((item, index) => (
                  <article key={`${item.type}-${item.source_reference}-${index}`} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-tc-text">{item.type.replace(/_/g, " ")}</p>
                        <p className="mt-1 text-[12px] text-tc-text-faint">
                          {item.source_type} · {item.source_reference}
                        </p>
                      </div>
                      <EvidenceStatus status={item.status} />
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-tc-text-muted">
                      {item.excerpt || "No excerpt was provided for this evidence item."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-tc-text-muted">No visible evidence has been attached to this matter yet.</p>
            )}
          </ProductPanel>

          <ProductPanel aria-labelledby="activity-title" className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-tc-text-faint" />
              <h2 id="activity-title" className="text-sm font-medium text-tc-text">
                Activity
              </h2>
            </div>
            {timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={`${event.type}-${event.created_at}-${index}`} className="flex gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-tc-border bg-tc-surface-subtle">
                      <CalendarClock className="size-4 text-tc-text-faint" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-tc-text">{event.label}</p>
                      <div className="mt-1">
                        <RelativeTime date={event.created_at} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-tc-text-muted">No activity has been recorded for this matter yet.</p>
            )}
          </ProductPanel>
        </main>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <ProductPanel aria-labelledby="matter-info-title" className="space-y-4">
            <h2 id="matter-info-title" className="text-sm font-medium text-tc-text">
              Matter Info
            </h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <dt className="text-tc-text-muted">Reference</dt>
                <dd className="font-mono text-tc-text">{matter.case_reference}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <dt className="text-tc-text-muted">Status</dt>
                <dd>
                  <ProductStatusBadge label={status.label} tone={status.tone} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <dt className="text-tc-text-muted">Decision</dt>
                <dd>
                  <ProductStatusBadge label={decision.label} tone={decision.tone} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <dt className="text-tc-text-muted">Submitted</dt>
                <dd>
                  <RelativeTime date={matter.submitted_at} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-[12px]">
                <dt className="text-tc-text-muted">Evidence</dt>
                <dd className="text-tc-text">{evidence.length} items</dd>
              </div>
            </dl>
            <Link
              href={`/matters/${matter.id}/summary`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-[13px] font-medium text-tc-text transition-colors hover:bg-white/[0.05]"
            >
              <Download className="size-4" />
              Export Summary
            </Link>
          </ProductPanel>

          {matter.customer_status === "resolved" ? (
            <ProductPanel aria-labelledby="reopen-title" className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCcw className="size-4 text-tc-text-faint" />
                <h2 id="reopen-title" className="text-sm font-medium text-tc-text">
                  Reopen Matter
                </h2>
              </div>
              <form onSubmit={handleReopen} className="space-y-3">
                <div>
                  <label htmlFor="reopen-note" className="mb-2 block text-[12px] font-medium text-tc-text-muted">
                    Reopen note
                  </label>
                  <textarea
                    id="reopen-note"
                    value={reopenNote}
                    onChange={(event) => setReopenNote(event.target.value)}
                    rows={4}
                    required
                    className="w-full resize-none rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-sm text-tc-text outline-none transition-colors placeholder:text-tc-text-faint focus:border-tc-accent"
                    placeholder="Reason for reopening"
                  />
                </div>
                {reopenError ? (
                  <p role="alert" className="text-[12px] text-tc-danger">
                    {reopenError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={reopening}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-tc-accent px-3 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCcw className="size-4" />
                  {reopening ? "Reopening..." : "Reopen Matter"}
                </button>
              </form>
            </ProductPanel>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
