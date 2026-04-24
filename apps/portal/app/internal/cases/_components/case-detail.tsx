import React from "react";
import Link from "next/link";
import { CaseDetail as CaseDetailType, Analyst } from "../types";
import { ReassignCaseForm } from "./decision-form";
import { PropertyMatchActions } from "./property-match-actions";
import { StatusDot, StatusBadge } from "./status-dot";
import { RelativeTime } from "./relative-time";
import { Avatar } from "./avatar";
import { CopyButton } from "./copy-button";
import { Timeline } from "@/app/_components/timeline";

function TimelineIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    case_created: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
    ),
    case_reassigned: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h3v3h-3zM8 3h3v3H8zM5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z" /></svg>
    ),
    evidence_added: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
    ),
    party_added: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
    decision_recorded: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    case_reopened: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
    ),
    case_closed: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></svg>
    ),
    case_resolved: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    property_match_confirmed: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
  };
  return icons[type] ?? icons.case_created;
}

export function CaseDetail({
  detail,
  analysts,
  actorId,
  analystMap,
  activeTab = "overview",
}: {
  detail: CaseDetailType;
  analysts: Analyst[];
  actorId: string;
  analystMap: Map<string, string>;
  activeTab?: string;
}) {
  const c = detail.case;
  const assigneeName = analystMap.get(c.assignee_id) ?? c.assignee_id;
  const createdByName = analystMap.get(c.created_by) ?? c.created_by;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">
              {c.case_reference}
            </span>
            <CopyButton text={c.case_reference} />
          </div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground leading-tight">
            {c.property_description}
          </h1>
          <p className="text-[13px] text-muted mt-1.5">
            {c.locality_or_area} · {c.municipality_or_deeds_office}
          </p>
        </div>
        <div className="shrink-0 pt-1">
          <StatusBadge status={c.status} />
        </div>
      </div>

      {/* Property Details */}
      {activeTab === "overview" && (
      <div className="border border-border rounded-2xl bg-card/20 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold">Property Details</h2>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          <DetailItem label="Locality" value={c.locality_or_area} />
          <DetailItem label="Municipality" value={c.municipality_or_deeds_office} />
          <DetailItem label="Title Reference" value={c.title_reference} />
          <DetailItem label="Matter Reference" value={c.matter_reference} />
        </dl>
        <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-6 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <Avatar name={assigneeName} size={18} />
            Assignee: <span className="text-foreground/70">{assigneeName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Avatar name={createdByName} size={18} />
            Created by: <span className="text-foreground/70">{createdByName}</span>
          </span>
          <span className="hidden md:inline">
            <RelativeTime date={c.created_at} />
          </span>
        </div>
      </div>
      )}

      {/* Assignment */}
      {activeTab === "overview" && (
      <div className="border border-border rounded-2xl bg-card/20 p-6">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Assignment</h2>
        <ReassignCaseForm caseId={c.id} analysts={analysts} actorId={actorId} />
      </div>
      )}

      {/* Property Matches */}
      {activeTab === "overview" && detail.matches.length > 0 && (
        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Property Matches</h2>
          <div className="space-y-3">
            {detail.matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-4">
                  <StatusDot status={m.status} />
                  <span className="text-[13px] text-foreground/80 font-medium">{m.match_source}</span>
                  <span className="text-[11px] text-muted font-mono">{m.confidence}% confidence</span>
                </div>
                <PropertyMatchActions caseId={c.id} matchId={m.id} actorId={actorId} status={m.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {(activeTab === "overview" || activeTab === "evidence") && detail.evidence.length > 0 && (
        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Evidence</h2>
          <div className="space-y-4">
            {detail.evidence.map((e) => (
              <div key={e.id} className="py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px] font-semibold text-foreground/90">{e.evidence_type}</span>
                  <span className="text-muted">·</span>
                  <span className="text-[11px] text-muted">{e.source_type}</span>
                </div>
                <p className="text-[13px] text-foreground/60 leading-relaxed">{e.excerpt || e.source_reference}</p>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={e.evidence_status} />
                  <span className="text-[11px] text-muted-more flex items-center gap-1">
                    <Avatar name={analystMap.get(e.created_by) ?? e.created_by} size={14} />
                    {analystMap.get(e.created_by) ?? e.created_by}
                  </span>
                  <RelativeTime date={e.created_at} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parties */}
      {(activeTab === "overview" || activeTab === "parties") && detail.parties.length > 0 && (
        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Parties</h2>
          <div className="flex flex-wrap gap-2">
            {detail.parties.map((p) => (
              <div
                key={p.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 bg-card/40 text-[12px]"
              >
                <Avatar name={p.display_name} size={18} />
                <span className="text-foreground/90 font-medium">{p.display_name}</span>
                <span className="text-muted capitalize">{p.role}</span>
                <span className="text-muted-more capitalize">{p.entity_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisions */}
      {activeTab === "overview" && detail.decisions.length > 0 && (
        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Decisions</h2>
          <div className="space-y-5">
            {detail.decisions.map((d) => (
              <div key={d.id} className="py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[13px] font-bold"
                    style={{
                      color: d.decision === "clear" ? "#4ade80" : d.decision === "stop" ? "#ef4444" : "#fbbf24",
                    }}
                  >
                    {d.decision}
                  </span>
                  <span className="text-muted">·</span>
                  <StatusBadge status={d.status} />
                  <span className="text-muted">·</span>
                  <span className="text-[11px] text-muted-more flex items-center gap-1">
                    <Avatar name={analystMap.get(d.created_by) ?? d.created_by} size={14} />
                    {analystMap.get(d.created_by) ?? d.created_by}
                  </span>
                </div>
                <p className="text-[13px] text-foreground/60 leading-relaxed">{d.note}</p>
                {d.reason_codes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {d.reason_codes.map((rc) => (
                      <span
                        key={rc.code}
                        className="px-2 py-0.5 rounded-md text-[10px] border border-border-light text-muted-more font-mono"
                      >
                        {rc.code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Timeline */}
      {(activeTab === "overview" || activeTab === "activity") && (
      <div className="border border-border rounded-2xl bg-card/20 p-6">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Activity</h2>
        <div className="space-y-0">
          {detail.audit_events.map((ev, i) => (
            <div key={ev.id} className="flex gap-3 relative">
              {i < detail.audit_events.length - 1 && (
                <div className="absolute left-[17px] top-7 bottom-0 w-px bg-border/40" />
              )}
              <div className="shrink-0 w-9 h-9 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted z-10">
                <TimelineIcon type={ev.event_type} />
              </div>
              <div className="pb-5 pt-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-foreground/80 capitalize">
                    {ev.event_type.replace(/_/g, " ")}
                  </span>
                  <span className="text-muted">·</span>
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <Avatar name={analystMap.get(ev.actor_id) ?? ev.actor_id} size={14} />
                    {analystMap.get(ev.actor_id) ?? ev.actor_id}
                  </span>
                </div>
                <RelativeTime date={ev.created_at} />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Timeline */}
      {activeTab === "timeline" && (
        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Timeline</h2>
          <Timeline
            events={detail.audit_events.map((ev) => ({
              id: ev.id,
              type: ev.event_type,
              description: ev.event_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
              timestamp: ev.created_at,
              actor: analystMap.get(ev.actor_id) ?? ev.actor_id,
              metadata: ev.metadata,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted mb-1.5 font-medium">{label}</dt>
      <dd className="text-[13px] text-foreground/90 font-medium">
        {value || <span className="text-muted-more">—</span>}
      </dd>
    </div>
  );
}
