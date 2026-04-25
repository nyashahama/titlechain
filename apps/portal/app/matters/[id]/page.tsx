"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMatterDetail, reopenMatter } from "../api";
import type { MatterDetail } from "../types";
import { StatusBadge } from "../../internal/cases/_components/status-dot";
import { RelativeTime } from "../../internal/cases/_components/relative-time";
import { CopyButton } from "../../internal/cases/_components/copy-button";

function customerStatusToInternal(status: string) {
  switch (status) {
    case "submitted": return "open";
    case "in_review": return "in_review";
    case "resolved": return "resolved";
    case "reopened": return "reopened";
    default: return "open";
  }
}

export default function MatterDetailPage() {
  const params = useParams();
  const [detail, setDetail] = useState<MatterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reopenNote, setReopenNote] = useState("");
  const [reopening, setReopening] = useState(false);
  const [reopenError, setReopenError] = useState("");

  function loadMatter() {
    setLoading(true);
    getMatterDetail(params.id as string)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMatter();
  }, [params.id]);

  async function handleReopen(e: React.FormEvent) {
    e.preventDefault();
    if (!reopenNote.trim()) return;
    setReopening(true);
    setReopenError("");
    try {
      const updated = await reopenMatter(params.id as string, { note: reopenNote });
      setDetail(updated);
      setReopenNote("");
    } catch (err) {
      setReopenError(err instanceof Error ? err.message : "Failed to reopen");
    } finally {
      setReopening(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="flex items-center justify-center py-28">
          <svg className="animate-spin h-6 w-6 text-muted" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted">{error || "Matter not found"}</p>
      </div>
    );
  }

  const matter = detail.summary;
  const decisionColor = matter.decision === "clear" ? "#4ade80" : matter.decision === "stop" ? "#ef4444" : matter.decision === "review" ? "#fbbf24" : undefined;

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10 animate-slide-in">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/matters"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-200 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to matters
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">{matter.case_reference}</span>
                <CopyButton text={matter.case_reference} />
              </div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground leading-tight">
                {matter.property_description}
              </h1>
              <p className="text-[13px] text-muted mt-1.5">
                {matter.locality_or_area} · {matter.municipality_or_deeds_office}
              </p>
              {matter.customer_reference && (
                <p className="text-[12px] text-muted-more mt-0.5">Ref: {matter.customer_reference}</p>
              )}
            </div>
            <div className="shrink-0 pt-1">
              <StatusBadge status={customerStatusToInternal(matter.customer_status) as any} />
            </div>
          </div>

          {matter.decision && decisionColor && (
            <div className="border rounded-2xl p-6" style={{ borderColor: `${decisionColor}30`, backgroundColor: `${decisionColor}0D` }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${decisionColor}18` }}>
                  {matter.decision === "clear" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={decisionColor} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : matter.decision === "stop" ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={decisionColor} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={decisionColor} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-[0.12em] font-semibold">Clear-to-Lodge Decision</p>
                  <p className="text-[24px] font-bold" style={{ color: decisionColor }}>
                    {matter.decision === "clear" ? "Clear to Lodge" : matter.decision === "stop" ? "Stop — Do Not Proceed" : "Review Required"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-muted ml-[72px]">
                <RelativeTime date={matter.updated_at} />
              </div>
            </div>
          )}

          <div className="border border-border rounded-2xl bg-card/20 p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Property Details</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted mb-1.5 font-medium">Locality</dt>
                <dd className="text-[13px] text-foreground/90 font-medium">{matter.locality_or_area}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted mb-1.5 font-medium">Municipality</dt>
                <dd className="text-[13px] text-foreground/90 font-medium">{matter.municipality_or_deeds_office}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted mb-1.5 font-medium">Title Reference</dt>
                <dd className="text-[13px] text-foreground/90 font-medium">{matter.title_reference || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted mb-1.5 font-medium">Case Reference</dt>
                <dd className="text-[13px] text-foreground/90 font-mono">{matter.case_reference}</dd>
              </div>
            </dl>
          </div>

          {detail.reasons.length > 0 && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Reasons ({detail.reasons.length})</h2>
              <div className="space-y-2">
                {detail.reasons.map((r) => (
                  <div key={r.code} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-border/30">
                    <span className="text-[11px] font-mono text-muted-more">{r.code}</span>
                    <span className="text-[13px] text-foreground/80">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.evidence.length > 0 && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Evidence ({detail.evidence.length})</h2>
              <div className="space-y-4">
                {detail.evidence.map((e, i) => (
                  <div key={i} className="py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[13px] font-semibold text-foreground/90">{e.type}</span>
                      <span className="text-muted">·</span>
                      <span className="text-[11px] text-muted">{e.source_type}</span>
                    </div>
                    <p className="text-[13px] text-foreground/60 leading-relaxed">{e.excerpt || e.source_reference}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={e.status as any} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.timeline.length > 0 && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Activity</h2>
              <div className="space-y-0">
                {detail.timeline.map((ev, i) => (
                  <div key={i} className="flex gap-3 relative">
                    {i < detail.timeline.length - 1 && (
                      <div className="absolute left-[17px] top-7 bottom-0 w-px bg-border/40" />
                    )}
                    <div className="shrink-0 w-9 h-9 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted z-10">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                    </div>
                    <div className="pb-5 pt-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-medium text-foreground/80">{ev.label}</span>
                      </div>
                      <RelativeTime date={ev.created_at} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {matter.customer_status === "resolved" && (
            <div className="border border-border rounded-2xl bg-card/20 p-5">
              <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Reopen Matter</h3>
              <form onSubmit={handleReopen} className="space-y-3">
                <textarea
                  value={reopenNote}
                  onChange={(e) => setReopenNote(e.target.value)}
                  rows={3}
                  placeholder="Reason for reopening..."
                  className="w-full bg-card border border-border-light rounded-xl px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
                />
                {reopenError && <p className="text-[12px] text-red-400">{reopenError}</p>}
                <button
                  type="submit"
                  disabled={reopening}
                  className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
                >
                  {reopening ? "Reopening..." : "Reopen Matter"}
                </button>
              </form>
            </div>
          )}

          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/matters/${params.id}/summary`}
                className="w-full flex items-center gap-3 text-left text-[13px] text-foreground/80 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Print / Export Summary
              </Link>
            </div>
          </div>

          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Matter Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Reference</span>
                <span className="text-foreground/80 font-mono">{matter.case_reference}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Status</span>
                <span className="text-foreground/80 capitalize">{matter.customer_status.replace(/_/g, " ")}</span>
              </div>
              {matter.decision && (
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">Decision</span>
                  <span className="font-medium" style={{ color: decisionColor }}>{matter.decision}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Submitted</span>
                <RelativeTime date={matter.submitted_at} />
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Evidence</span>
                <span className="text-foreground/80">{detail.evidence.length} items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
