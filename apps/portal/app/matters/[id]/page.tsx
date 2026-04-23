"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMatter, updateMatter, Matter } from "../../_lib/mock-data";
import { StatusDot, StatusBadge } from "../../internal/cases/_components/status-dot";
import { RelativeTime } from "../../internal/cases/_components/relative-time";
import { Avatar } from "../../internal/cases/_components/avatar";
import { CopyButton } from "../../internal/cases/_components/copy-button";

function TimelineIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    "Matter created": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>,
    "Clear-to-Lodge check completed": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    "Evidence added": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    "Rates clearance uploaded": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    "Trust documents requested": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
    "Development docs uploaded": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    "Note added": <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  };
  return icons[type] ?? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>;
}

export default function MatterDetailPage() {
  const params = useParams();
  const [matter, setMatter] = useState<Matter | null>(() => getMatter(params.id as string));

  if (!matter) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted">Matter not found</p>
      </div>
    );
  }

  const decisionColor = matter.decision === "clear" ? "#4ade80" : matter.decision === "stop" ? "#ef4444" : "#fbbf24";
  const decisionBg = matter.decision === "clear" ? "rgba(74,222,128,0.06)" : matter.decision === "stop" ? "rgba(239,68,68,0.06)" : "rgba(251,191,36,0.06)";
  const decisionBorder = matter.decision === "clear" ? "rgba(74,222,128,0.2)" : matter.decision === "stop" ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.2)";

  function handleAddNote(note: string) {
    if (!matter) return;
    const updated: Matter = {
      ...matter,
      audit_log: [
        ...matter.audit_log,
        { id: `a_${Date.now()}`, event_type: "Note added", actor_name: "You", created_at: new Date().toISOString() },
      ],
      updated_at: new Date().toISOString(),
    };
    updateMatter(updated);
    setMatter(updated);
  }

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10 animate-slide-in">
      {/* Top Bar */}
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">{matter.reference}</span>
                <CopyButton text={matter.reference} />
              </div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground leading-tight">
                {matter.property_description}
              </h1>
              <p className="text-[13px] text-muted mt-1.5">
                {matter.locality_or_area} · {matter.municipality_or_deeds_office}
              </p>
            </div>
            <div className="shrink-0 pt-1">
              <StatusBadge status={matter.status} />
            </div>
          </div>

          {/* Decision Banner */}
          {matter.decision && (
            <div className="border rounded-2xl p-6" style={{ borderColor: decisionBorder, backgroundColor: decisionBg }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${decisionColor}18` }}>
                  <DecisionIcon decision={matter.decision} color={decisionColor} />
                </div>
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-[0.12em] font-semibold">Clear-to-Lodge Decision</p>
                  <p className="text-[24px] font-bold" style={{ color: decisionColor }}>
                    {matter.decision === "clear" ? "Clear to Lodge" : matter.decision === "stop" ? "Stop — Do Not Proceed" : "Review Required"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-muted ml-[72px]">
                <span>Confidence: <span className="text-foreground/70 font-semibold">{matter.confidence}%</span></span>
                <span className="text-border-light">·</span>
                <RelativeTime date={matter.updated_at} />
              </div>
            </div>
          )}

          {/* Verification Steps */}
          {matter.decision && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Verification Steps</h2>
              <div className="flex items-center gap-2">
                {[
                  { label: "Intake", done: true },
                  { label: "Title Search", done: true },
                  { label: "Municipal", done: matter.flags.some((f) => f.category === "Municipal") },
                  { label: "Fraud Check", done: matter.evidence.some((e) => e.type === "Fraud Check") },
                  { label: "Decision", done: !!matter.decision },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                        style={{
                          backgroundColor: step.done ? `${decisionColor}20` : "rgba(255,255,255,0.05)",
                          color: step.done ? decisionColor : "rgba(255,255,255,0.3)",
                          border: `1px solid ${step.done ? `${decisionColor}30` : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {step.done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span className="text-[10px] text-muted whitespace-nowrap">{step.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-px flex-1 mb-4" style={{ backgroundColor: step.done ? `${decisionColor}30` : "rgba(255,255,255,0.06)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="border border-border rounded-2xl bg-card/20 p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Property Details</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
              <DetailItem label="Locality" value={matter.locality_or_area} />
              <DetailItem label="Municipality" value={matter.municipality_or_deeds_office} />
              <DetailItem label="Title Reference" value={matter.title_reference} />
              <DetailItem label="Matter Reference" value={matter.matter_reference} />
            </dl>
          </div>

          {/* Flags */}
          {matter.flags.length > 0 && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Flags ({matter.flags.length})</h2>
              <div className="space-y-2.5">
                {matter.flags.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-start gap-3 p-4 rounded-xl transition-colors"
                    style={{
                      backgroundColor: f.severity === "critical" ? "rgba(239,68,68,0.06)" : f.severity === "warning" ? "rgba(251,191,36,0.06)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${f.severity === "critical" ? "rgba(239,68,68,0.12)" : f.severity === "warning" ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <FlagDot severity={f.severity} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground/90 font-medium">{f.message}</p>
                      <p className="text-[11px] text-muted mt-1">{f.category} · {f.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {matter.evidence.length > 0 && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Evidence ({matter.evidence.length})</h2>
              <div className="space-y-4">
                {matter.evidence.map((e) => (
                  <div key={e.id} className="py-3 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[13px] font-semibold text-foreground/90">{e.type}</span>
                      <span className="text-muted">·</span>
                      <span className="text-[11px] text-muted">{e.source}</span>
                    </div>
                    <p className="text-[13px] text-foreground/60 leading-relaxed">{e.excerpt || e.reference}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <StatusBadge status={e.status} />
                      <span className="text-[11px] text-muted-more font-mono">{e.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parties */}
          {matter.parties.length > 0 && (
            <div className="border border-border rounded-2xl bg-card/20 p-6">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Parties</h2>
              <div className="flex flex-wrap gap-2">
                {matter.parties.map((p) => (
                  <div key={p.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-card/40 text-[12px]">
                    <Avatar name={p.display_name} size={18} />
                    <span className="text-foreground/90 font-medium">{p.display_name}</span>
                    <span className="text-muted capitalize">{p.role}</span>
                    <span className="text-muted-more capitalize">{p.entity_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="border border-border rounded-2xl bg-card/20 p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Activity</h2>
            <div className="space-y-0">
              {matter.audit_log.map((ev, i) => (
                <div key={ev.id} className="flex gap-3 relative">
                  {i < matter.audit_log.length - 1 && (
                    <div className="absolute left-[17px] top-7 bottom-0 w-px bg-border/40" />
                  )}
                  <div className="shrink-0 w-9 h-9 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted z-10">
                    <TimelineIcon type={ev.event_type} />
                  </div>
                  <div className="pb-5 pt-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-medium text-foreground/80">{ev.event_type}</span>
                      <span className="text-muted">·</span>
                      <span className="text-[11px] text-muted">{ev.actor_name}</span>
                    </div>
                    <RelativeTime date={ev.created_at} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          {/* Quick Actions */}
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Upload document", icon: UploadIcon },
                { label: "Add party", icon: UserPlusIcon },
                { label: "Re-run check", icon: RefreshIcon },
                { label: "Export report", icon: DownloadIcon },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 text-left text-[13px] text-foreground/80 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                >
                  <action.icon />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Note */}
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Add Note</h3>
            <NoteForm onSubmit={handleAddNote} />
          </div>

          {/* Matter Info */}
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Matter Info</h3>
            <div className="space-y-3">
              {[
                { label: "Reference", value: matter.reference },
                { label: "Status", value: <StatusDot status={matter.status} /> },
                ...(matter.decision ? [{ label: "Decision", value: <span className="font-medium" style={{ color: decisionColor }}>{matter.decision}</span> }] : []),
                ...(matter.confidence > 0 ? [{ label: "Confidence", value: <span className="text-foreground/80 font-mono">{matter.confidence}%</span> }] : []),
                { label: "Created", value: <RelativeTime date={matter.created_at} /> },
                { label: "Updated", value: <RelativeTime date={matter.updated_at} /> },
                { label: "Evidence", value: <span className="text-foreground/80">{matter.evidence.length} items</span> },
                { label: "Flags", value: <span className="text-foreground/80">{matter.flags.length} items</span> },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-foreground/80">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteForm({ onSubmit }: { onSubmit: (note: string) => void }) {
  const [note, setNote] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    onSubmit(note);
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Add a note..."
        className="w-full bg-card border border-border-light rounded-xl px-3 py-2 text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors resize-none"
      />
      <button
        type="submit"
        className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
      >
        Add Note
      </button>
    </form>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted mb-1.5 font-medium">{label}</dt>
      <dd className="text-[13px] text-foreground/90 font-medium">{value || <span className="text-muted-more">—</span>}</dd>
    </div>
  );
}

function DecisionIcon({ decision, color }: { decision: string; color: string }) {
  if (decision === "clear") {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
  }
  if (decision === "stop") {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  }
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}

function FlagDot({ severity }: { severity: string }) {
  const color = severity === "critical" ? "#ef4444" : severity === "warning" ? "#fbbf24" : "#a1a1aa";
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1.5">
      <span className="absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

function UploadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
function UserPlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>;
}
function RefreshIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
}
function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
