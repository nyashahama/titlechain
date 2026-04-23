"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getMatter } from "../../_lib/mock-data";
import { StatusDot, StatusBadge } from "../../internal/cases/_components/status-dot";
import { RelativeTime } from "../../internal/cases/_components/relative-time";
import { Avatar } from "../../internal/cases/_components/avatar";
import { CopyButton } from "../../internal/cases/_components/copy-button";

export default function MatterDetailPage() {
  const params = useParams();
  const matter = getMatter(params.id as string);

  if (!matter) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted">Matter not found</p>
      </div>
    );
  }

  const decisionColor =
    matter.decision === "clear" ? "#4ade80" : matter.decision === "stop" ? "#ef4444" : "#fbbf24";

  return (
    <div className="p-6 md:p-10 max-w-4xl animate-slide-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/matters"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-200 group mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to matters
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">{matter.reference}</span>
              <CopyButton text={matter.reference} />
            </div>
            <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground leading-tight">
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
      </div>

      {/* Decision Banner */}
      {matter.decision && (
        <div
          className="border rounded-2xl p-6 mb-6"
          style={{
            borderColor: `${decisionColor}30`,
            backgroundColor: `${decisionColor}08`,
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${decisionColor}20` }}
            >
              <DecisionIcon decision={matter.decision} color={decisionColor} />
            </div>
            <div>
              <p className="text-[11px] text-muted uppercase tracking-wider font-medium">Clear-to-Lodge Decision</p>
              <p className="text-[20px] font-bold" style={{ color: decisionColor }}>
                {matter.decision === "clear" ? "Clear to Lodge" : matter.decision === "stop" ? "Stop — Do Not Proceed" : "Review Required"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted">
            <span>Confidence: <span className="text-foreground/70 font-medium">{matter.confidence}%</span></span>
            <span>·</span>
            <RelativeTime date={matter.updated_at} />
          </div>
        </div>
      )}

      {/* Property Details */}
      <div className="border border-border rounded-2xl bg-card/20 p-6 mb-6">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Property Details</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
          <DetailItem label="Locality" value={matter.locality_or_area} />
          <DetailItem label="Municipality" value={matter.municipality_or_deeds_office} />
          <DetailItem label="Title Reference" value={matter.title_reference} />
          <DetailItem label="Matter Reference" value={matter.matter_reference} />
        </dl>
      </div>

      {/* Flags */}
      {matter.flags.length > 0 && (
        <div className="border border-border rounded-2xl bg-card/20 p-6 mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Flags</h2>
          <div className="space-y-2">
            {matter.flags.map((f) => (
              <div
                key={f.id}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  backgroundColor:
                    f.severity === "critical"
                      ? "rgba(239,68,68,0.08)"
                      : f.severity === "warning"
                      ? "rgba(251,191,36,0.08)"
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    f.severity === "critical"
                      ? "rgba(239,68,68,0.15)"
                      : f.severity === "warning"
                      ? "rgba(251,191,36,0.15)"
                      : "rgba(255,255,255,0.06)"
                  }`,
                }}
              >
                <FlagDot severity={f.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground/90 font-medium">{f.message}</p>
                  <p className="text-[11px] text-muted mt-0.5">{f.category} · {f.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {matter.evidence.length > 0 && (
        <div className="border border-border rounded-2xl bg-card/20 p-6 mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Evidence</h2>
          <div className="space-y-3">
            {matter.evidence.map((e) => (
              <div key={e.id} className="py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-foreground/90">{e.type}</span>
                  <span className="text-muted">·</span>
                  <span className="text-[11px] text-muted">{e.source}</span>
                </div>
                <p className="text-[13px] text-foreground/60 leading-relaxed">{e.excerpt || e.reference}</p>
                <div className="flex items-center gap-3 mt-1.5">
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
        <div className="border border-border rounded-2xl bg-card/20 p-6 mb-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Parties</h2>
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

      {/* Audit Log */}
      <div className="border border-border rounded-2xl bg-card/20 p-6">
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Activity</h2>
        <div className="space-y-0">
          {matter.audit_log.map((ev, i) => (
            <div key={ev.id} className="flex gap-3 relative">
              {i < matter.audit_log.length - 1 && (
                <div className="absolute left-[17px] top-7 bottom-0 w-px bg-border/40" />
              )}
              <div className="shrink-0 w-9 h-9 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted z-10">
                <ActivityIcon />
              </div>
              <div className="pb-4 pt-1.5 flex-1 min-w-0">
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
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted mb-1 font-medium">{label}</dt>
      <dd className="text-[13px] text-foreground/90 font-medium">{value || <span className="text-muted-more">—</span>}</dd>
    </div>
  );
}

function DecisionIcon({ decision, color }: { decision: string; color: string }) {
  if (decision === "clear") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (decision === "stop") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function FlagDot({ severity }: { severity: string }) {
  const color = severity === "critical" ? "#ef4444" : severity === "warning" ? "#fbbf24" : "#a1a1aa";
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1.5">
      <span className="absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: color }} />
    </span>
  );
}

function ActivityIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
