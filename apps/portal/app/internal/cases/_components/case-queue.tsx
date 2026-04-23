"use client";

import { CaseSummary } from "../types";
import Link from "next/link";
import { StatusDot } from "./status-dot";
import { RelativeTime } from "./relative-time";
import { Avatar } from "./avatar";
import { CopyButton } from "./copy-button";

export function CaseQueue({ cases, analystMap }: { cases: CaseSummary[] | null; analystMap: Map<string, string> }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-[15px] text-foreground/80 mb-1.5 font-medium">No cases found</p>
        <p className="text-[13px] text-muted max-w-[240px]">Create a new case to get started with your review queue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {cases.map((c, i) => {
        const assigneeName = analystMap.get(c.assignee_id) ?? c.assignee_id;
        return (
          <Link
            key={c.id}
            href={`/internal/cases/${c.id}`}
            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {/* Status */}
            <div className="shrink-0 w-[100px]">
              <StatusDot status={c.status} pulse={c.status === "open" || c.status === "reopened"} />
            </div>

            {/* Reference + Property */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">
                  {c.case_reference}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <CopyButton text={c.case_reference} />
                </span>
              </div>
              <p className="text-[13px] text-foreground/90 font-medium truncate">{c.property_description}</p>
              <p className="text-[11px] text-muted truncate">{c.locality_or_area} · {c.municipality_or_deeds_office}</p>
            </div>

            {/* Assignee */}
            <div className="hidden sm:flex items-center gap-2 shrink-0 w-[140px]">
              <Avatar name={assigneeName} size={20} />
              <span className="text-[12px] text-muted truncate">{assigneeName}</span>
            </div>

            {/* Updated */}
            <div className="shrink-0 w-[80px] text-right">
              <RelativeTime date={c.updated_at} />
            </div>

            {/* Arrow on hover */}
            <div className="shrink-0 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
