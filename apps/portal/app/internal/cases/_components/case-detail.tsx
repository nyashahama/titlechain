import Link from "next/link";
import { CaseDetail as CaseDetailType, Analyst } from "../types";
import { ReassignCaseForm } from "./decision-form";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-gray-100 text-gray-800",
    in_review: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed_unresolved: "bg-red-100 text-red-800",
    reopened: "bg-blue-100 text-blue-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-800";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{c.case_reference}</h1>
          <p className="text-sm text-gray-500">
            {c.property_description} &middot; {c.locality_or_area}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-5 ${statusBadge(c.status)}`}
        >
          {c.status}
        </span>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
        <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Description</dt>
            <dd className="font-medium text-gray-900">{c.property_description}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Locality</dt>
            <dd className="font-medium text-gray-900">{c.locality_or_area}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Municipality</dt>
            <dd className="font-medium text-gray-900">{c.municipality_or_deeds_office}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Title Reference</dt>
            <dd className="font-medium text-gray-900">{c.title_reference || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Matter Reference</dt>
            <dd className="font-medium text-gray-900">{c.matter_reference || "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Assignee</dt>
            <dd className="font-medium text-gray-900">{c.assignee_id}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Assignment</h2>
        <div className="mt-2">
          <ReassignCaseForm caseId={c.id} analysts={analysts} actorId={actorId} />
        </div>
      </div>

      {detail.matches.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Property Matches</h2>
          <ul className="mt-2 space-y-2">
            {detail.matches.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-medium">{m.match_source}</span> &middot; confidence{" "}
                {m.confidence}% &middot;{" "}
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusBadge(m.status)}`}
                >
                  {m.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.evidence.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Evidence</h2>
          <ul className="mt-2 space-y-3">
            {detail.evidence.map((e) => (
              <li key={e.id} className="text-sm">
                <div className="font-medium">
                  {e.evidence_type} &middot; {e.source_type}
                </div>
                <div className="text-gray-600">{e.excerpt || e.source_reference}</div>
                <div className="text-xs text-gray-500">
                  Status: {e.evidence_status} &middot; By: {e.created_by}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.parties.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Parties</h2>
          <ul className="mt-2 space-y-2">
            {detail.parties.map((p) => (
              <li key={p.id} className="text-sm">
                <span className="font-medium">{p.display_name}</span> &middot; {p.role} &middot;{" "}
                {p.entity_type}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.decisions.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Decisions</h2>
          <ul className="mt-2 space-y-3">
            {detail.decisions.map((d) => (
              <li key={d.id} className="text-sm">
                <div className="font-medium">
                  {d.decision} &middot; {d.status}
                </div>
                <div className="text-gray-600">{d.note}</div>
                <div className="text-xs text-gray-500">
                  Reason codes:{" "}
                  {d.reason_codes.map((rc) => rc.code).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Audit Timeline</h2>
        <ul className="mt-2 space-y-2">
          {detail.audit_events.map((ev) => (
            <li key={ev.id} className="text-sm">
              <span className="font-medium">{ev.event_type}</span> &middot; {ev.actor_id} &middot;{" "}
              {new Date(ev.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-4">
        <Link
          href="/internal/cases"
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to queue
        </Link>
      </div>
    </div>
  );
}
