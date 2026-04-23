import Link from "next/link";
import { CaseDetail as CaseDetailType, Analyst } from "../types";
import { ReassignCaseForm } from "./decision-form";
import { PropertyMatchActions } from "./property-match-actions";

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; glow: string }> = {
    open: { label: "Open", color: "#a1a1aa", glow: "rgba(161,161,170,0.15)" },
    in_review: { label: "In Review", color: "#fbbf24", glow: "rgba(251,191,36,0.15)" },
    resolved: { label: "Resolved", color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
    closed_unresolved: { label: "Unresolved", color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
    reopened: { label: "Reopened", color: "#60a5fa", glow: "rgba(96,165,250,0.15)" },
    candidate: { label: "Candidate", color: "#a1a1aa", glow: "rgba(161,161,170,0.15)" },
    confirmed: { label: "Confirmed", color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
    rejected: { label: "Rejected", color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
  };
  const cfg = configs[status] ?? configs.open;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide"
      style={{
        color: cfg.color,
        backgroundColor: `${cfg.glow}`,
        border: `1px solid ${cfg.glow}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

export function CaseDetail({
  detail,
  analysts,
  actorId,
}: {
  detail: CaseDetailType;
  analysts: Analyst[];
  actorId: string;
}) {
  const c = detail.case;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-foreground">{c.case_reference}</h1>
          <p className="text-[14px] text-muted mt-1">
            {c.property_description} · {c.locality_or_area}
          </p>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {/* Property Details Card */}
      <div className="border border-border rounded-xl bg-card/30 p-5">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-4">Property Details</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <dt className="text-[11px] text-muted mb-1">Description</dt>
            <dd className="text-[13px] text-foreground/90">{c.property_description}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted mb-1">Locality</dt>
            <dd className="text-[13px] text-foreground/90">{c.locality_or_area}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted mb-1">Municipality</dt>
            <dd className="text-[13px] text-foreground/90">{c.municipality_or_deeds_office}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted mb-1">Title Reference</dt>
            <dd className="text-[13px] text-foreground/90">{c.title_reference || <span className="text-muted-more">—</span>}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted mb-1">Matter Reference</dt>
            <dd className="text-[13px] text-foreground/90">{c.matter_reference || <span className="text-muted-more">—</span>}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted mb-1">Assignee</dt>
            <dd className="text-[13px] text-foreground/90">{c.assignee_id}</dd>
          </div>
        </dl>
      </div>

      {/* Assignment */}
      <div className="border border-border rounded-xl bg-card/30 p-5">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-3">Assignment</h2>
        <ReassignCaseForm caseId={c.id} analysts={analysts} actorId={actorId} />
      </div>

      {/* Property Matches */}
      {detail.matches.length > 0 && (
        <div className="border border-border rounded-xl bg-card/30 p-5">
          <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-4">Property Matches</h2>
          <div className="space-y-3">
            {detail.matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <StatusBadge status={m.status} />
                  <span className="text-[13px] text-foreground/80">{m.match_source}</span>
                  <span className="text-[11px] text-muted">confidence {m.confidence}%</span>
                </div>
                <PropertyMatchActions
                  caseId={c.id}
                  matchId={m.id}
                  actorId={actorId}
                  status={m.status}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {detail.evidence.length > 0 && (
        <div className="border border-border rounded-xl bg-card/30 p-5">
          <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-4">Evidence</h2>
          <div className="space-y-3">
            {detail.evidence.map((e) => (
              <div key={e.id} className="py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-medium text-foreground/90">{e.evidence_type}</span>
                  <span className="text-[11px] text-muted">·</span>
                  <span className="text-[11px] text-muted">{e.source_type}</span>
                </div>
                <p className="text-[13px] text-muted">{e.excerpt || e.source_reference}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={e.evidence_status} />
                  <span className="text-[11px] text-muted-more">by {e.created_by}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parties */}
      {detail.parties.length > 0 && (
        <div className="border border-border rounded-xl bg-card/30 p-5">
          <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-4">Parties</h2>
          <div className="space-y-3">
            {detail.parties.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <span className="text-[13px] font-medium text-foreground/90">{p.display_name}</span>
                <span className="text-[11px] text-muted capitalize">{p.role}</span>
                <span className="text-[11px] text-muted-more capitalize">{p.entity_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisions */}
      {detail.decisions.length > 0 && (
        <div className="border border-border rounded-xl bg-card/30 p-5">
          <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-4">Decisions</h2>
          <div className="space-y-4">
            {detail.decisions.map((d) => (
              <div key={d.id} className="py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[13px] font-semibold"
                    style={{
                      color: d.decision === "clear" ? "#4ade80" : d.decision === "stop" ? "#ef4444" : "#fbbf24",
                    }}
                  >
                    {d.decision}
                  </span>
                  <span className="text-[11px] text-muted">·</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-[13px] text-muted mt-1">{d.note}</p>
                {d.reason_codes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {d.reason_codes.map((rc) => (
                      <span
                        key={rc.code}
                        className="px-2 py-0.5 rounded-md text-[11px] border border-border-light text-muted-more"
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
      <div className="border border-border rounded-xl bg-card/30 p-5">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-4">Audit Timeline</h2>
        <div className="space-y-2">
          {detail.audit_events.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 text-[12px] py-1">
              <span className="text-muted-more w-28 shrink-0">
                {new Date(ev.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="text-foreground/70 font-medium">{ev.event_type}</span>
              <span className="text-muted">·</span>
              <span className="text-muted">{ev.actor_id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
