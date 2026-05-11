import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  GitBranch,
  Home,
  RotateCcw,
  UserPlus,
  XCircle,
} from "lucide-react";
import type { Analyst, CaseDetail as CaseDetailType } from "../types";
import { ReassignCaseForm } from "./decision-form";
import { PropertyMatchActions } from "./property-match-actions";
import { Avatar } from "./avatar";
import { Timeline } from "@/app/_components/timeline";
import { CopyAction } from "@/app/_components/product/CopyAction";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import {
  getCaseStatusMeta,
  getDecisionMeta,
  getEvidenceStatusMeta,
} from "@/app/_lib/product/status";

const timelineIcons: Record<string, LucideIcon> = {
  case_created: FilePlus2,
  case_reassigned: GitBranch,
  evidence_added: ClipboardCheck,
  party_added: UserPlus,
  decision_recorded: CheckCircle2,
  case_reopened: RotateCcw,
  case_closed: XCircle,
  case_resolved: CheckCircle2,
  property_match_confirmed: Home,
};

function TimelineIcon({ type }: { type: string }) {
  const Icon = timelineIcons[type] ?? FilePlus2;
  return <Icon className="size-4" />;
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const caseStatus = getCaseStatusMeta(c.status);

  return (
    <div className="space-y-6">
      <header className="grid gap-5 border-b border-tc-border pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="mb-2 flex min-w-0 items-center gap-1.5">
            <span className="truncate font-mono text-[11px] text-tc-text-faint tabular-nums">
              {c.case_reference}
            </span>
            <CopyAction text={c.case_reference} label={`Copy ${c.case_reference}`} />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-tc-text md:text-3xl">
            {c.property_description}
          </h1>
          <p className="mt-2 text-sm text-tc-text-muted">
            {c.locality_or_area} · {c.municipality_or_deeds_office}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <ProductStatusBadge label={caseStatus.label} tone={caseStatus.tone} />
        </div>
      </header>

      {activeTab === "overview" ? (
        <ProductPanel aria-labelledby="property-details-title" className="space-y-4">
          <h2 id="property-details-title" className="text-sm font-medium text-tc-text">
            Property Details
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Locality" value={c.locality_or_area} />
            <DetailItem label="Municipality" value={c.municipality_or_deeds_office} />
            <DetailItem label="Title Reference" value={c.title_reference} />
            <DetailItem label="Matter Reference" value={c.matter_reference} />
          </dl>
          <div className="flex flex-wrap items-center gap-4 border-t border-tc-border pt-4 text-[12px] text-tc-text-muted">
            <span className="flex items-center gap-1.5">
              <Avatar name={assigneeName} size={18} />
              Assignee: <span className="text-tc-text">{assigneeName}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Avatar name={createdByName} size={18} />
              Created by: <span className="text-tc-text">{createdByName}</span>
            </span>
            <RelativeTime date={c.created_at} />
          </div>
        </ProductPanel>
      ) : null}

      {activeTab === "overview" ? (
        <ProductPanel aria-labelledby="assignment-title" className="space-y-4">
          <h2 id="assignment-title" className="text-sm font-medium text-tc-text">
            Assignment
          </h2>
          <ReassignCaseForm caseId={c.id} analysts={analysts} actorId={actorId} />
        </ProductPanel>
      ) : null}

      {activeTab === "overview" && detail.matches.length > 0 ? (
        <ProductPanel aria-labelledby="matches-title" className="space-y-4">
          <h2 id="matches-title" className="text-sm font-medium text-tc-text">
            Property Matches
          </h2>
          <div className="divide-y divide-tc-border">
            {detail.matches.map((match) => (
              <div
                key={match.id}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <ProductStatusBadge label={formatStatusLabel(match.status)} tone="muted" />
                  <span className="text-[13px] font-medium text-tc-text">{match.match_source}</span>
                  <span className="font-mono text-[11px] text-tc-text-faint">{match.confidence}% confidence</span>
                </div>
                <PropertyMatchActions caseId={c.id} matchId={match.id} actorId={actorId} status={match.status} />
              </div>
            ))}
          </div>
        </ProductPanel>
      ) : null}

      {(activeTab === "overview" || activeTab === "evidence") && detail.evidence.length > 0 ? (
        <ProductPanel aria-labelledby="evidence-title" className="space-y-4">
          <h2 id="evidence-title" className="text-sm font-medium text-tc-text">
            Evidence
          </h2>
          <div className="divide-y divide-tc-border">
            {detail.evidence.map((evidence) => {
              const status = getEvidenceStatusMeta(evidence.evidence_status);

              return (
                <article key={evidence.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-tc-text">{evidence.evidence_type}</p>
                      <p className="mt-1 text-[12px] text-tc-text-faint">
                        {evidence.source_type} · {evidence.source_reference}
                      </p>
                    </div>
                    <ProductStatusBadge label={status.label} tone={status.tone} />
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-tc-text-muted">
                    {evidence.excerpt || evidence.source_reference}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-tc-text-faint">
                    <span className="flex items-center gap-1.5">
                      <Avatar name={analystMap.get(evidence.created_by) ?? evidence.created_by} size={14} />
                      {analystMap.get(evidence.created_by) ?? evidence.created_by}
                    </span>
                    <RelativeTime date={evidence.created_at} />
                  </div>
                </article>
              );
            })}
          </div>
        </ProductPanel>
      ) : null}

      {(activeTab === "overview" || activeTab === "parties") && detail.parties.length > 0 ? (
        <ProductPanel aria-labelledby="parties-title" className="space-y-4">
          <h2 id="parties-title" className="text-sm font-medium text-tc-text">
            Parties
          </h2>
          <div className="flex flex-wrap gap-2">
            {detail.parties.map((party) => (
              <div
                key={party.id}
                className="inline-flex items-center gap-2 rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-1.5 text-[12px]"
              >
                <Avatar name={party.display_name} size={18} />
                <span className="font-medium text-tc-text">{party.display_name}</span>
                <span className="capitalize text-tc-text-muted">{party.role}</span>
                <span className="capitalize text-tc-text-faint">{party.entity_type}</span>
              </div>
            ))}
          </div>
        </ProductPanel>
      ) : null}

      {activeTab === "overview" && detail.decisions.length > 0 ? (
        <ProductPanel aria-labelledby="decisions-title" className="space-y-4">
          <h2 id="decisions-title" className="text-sm font-medium text-tc-text">
            Decisions
          </h2>
          <div className="divide-y divide-tc-border">
            {detail.decisions.map((decision) => {
              const decisionMeta = getDecisionMeta(decision.decision);

              return (
                <article key={decision.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <ProductStatusBadge label={decisionMeta.label} tone={decisionMeta.tone} />
                    <ProductStatusBadge label={formatStatusLabel(decision.status)} tone="muted" />
                    <span className="flex items-center gap-1 text-[11px] text-tc-text-faint">
                      <Avatar name={analystMap.get(decision.created_by) ?? decision.created_by} size={14} />
                      {analystMap.get(decision.created_by) ?? decision.created_by}
                    </span>
                  </div>
                  <p className="text-[13px] leading-6 text-tc-text-muted">{decision.note}</p>
                  {decision.reason_codes.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {decision.reason_codes.map((reason) => (
                        <span
                          key={reason.code}
                          className="rounded-md border border-tc-border bg-tc-surface-subtle px-2 py-0.5 font-mono text-[10px] text-tc-text-faint"
                        >
                          {reason.code}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </ProductPanel>
      ) : null}

      {activeTab === "overview" || activeTab === "activity" ? (
        <ProductPanel aria-labelledby="activity-title" className="space-y-4">
          <h2 id="activity-title" className="text-sm font-medium text-tc-text">
            Activity
          </h2>
          <div className="space-y-0">
            {detail.audit_events.map((event, index) => (
              <div key={event.id} className="relative flex gap-3">
                {index < detail.audit_events.length - 1 ? (
                  <div className="absolute bottom-0 left-[15px] top-8 w-px bg-tc-border" />
                ) : null}
                <div className="z-10 flex size-8 shrink-0 items-center justify-center rounded-md border border-tc-border bg-tc-surface-subtle text-tc-text-faint">
                  <TimelineIcon type={event.event_type} />
                </div>
                <div className="min-w-0 flex-1 pb-5 pt-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium capitalize text-tc-text">
                      {event.event_type.replace(/_/g, " ")}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-tc-text-muted">
                      <Avatar name={analystMap.get(event.actor_id) ?? event.actor_id} size={14} />
                      {analystMap.get(event.actor_id) ?? event.actor_id}
                    </span>
                  </div>
                  <RelativeTime date={event.created_at} />
                </div>
              </div>
            ))}
          </div>
        </ProductPanel>
      ) : null}

      {activeTab === "timeline" ? (
        <ProductPanel aria-labelledby="timeline-title" className="space-y-4">
          <h2 id="timeline-title" className="text-sm font-medium text-tc-text">
            Timeline
          </h2>
          <Timeline
            events={detail.audit_events.map((event) => ({
              id: event.id,
              type: event.event_type,
              description: event.event_type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
              timestamp: event.created_at,
              actor: analystMap.get(event.actor_id) ?? event.actor_id,
              metadata: event.metadata,
            }))}
          />
        </ProductPanel>
      ) : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-tc-text">
        {value || <span className="text-tc-text-faint">Not provided</span>}
      </dd>
    </div>
  );
}
