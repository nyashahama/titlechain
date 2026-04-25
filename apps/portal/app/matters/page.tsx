"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listMatters } from "./api";
import type { MatterSummary } from "./types";
import { StatusDot } from "../internal/cases/_components/status-dot";
import { RelativeTime } from "../internal/cases/_components/relative-time";
import { CopyButton } from "../internal/cases/_components/copy-button";

function customerStatusToInternal(status: string) {
  switch (status) {
    case "submitted":
      return "open";
    case "in_review":
      return "in_review";
    case "resolved":
      return "resolved";
    case "reopened":
      return "reopened";
    default:
      return "open";
  }
}

export default function MattersPage() {
  const [matters, setMatters] = useState<MatterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMatters()
      .then(setMatters)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Matters</h1>
              <p className="text-[13px] text-muted mt-1">All your Clear-to-Lodge checks</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-28">
          <svg className="animate-spin h-6 w-6 text-muted" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Matters</h1>
            <p className="text-[13px] text-muted mt-1">All your Clear-to-Lodge checks</p>
          </div>
          <Link
            href="/matters/new"
            className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            New Check
          </Link>
        </div>
      </div>

      {matters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-[15px] text-foreground/80 mb-1.5 font-medium">No matters yet</p>
          <p className="text-[13px] text-muted max-w-[240px]">Create your first Clear-to-Lodge check to get started.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {matters.map((m) => (
            <Link
              key={m.id}
              href={`/matters/${m.id}`}
              className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
            >
              <div className="shrink-0 w-[100px]">
                <StatusDot status={customerStatusToInternal(m.customer_status) as any} pulse={m.customer_status === "submitted"} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">{m.case_reference}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <CopyButton text={m.case_reference} />
                  </span>
                </div>
                <p className="text-[13px] text-foreground/90 font-medium truncate">{m.property_description}</p>
                <p className="text-[11px] text-muted truncate">{m.locality_or_area} · {m.municipality_or_deeds_office}</p>
              </div>

              <div className="hidden md:block shrink-0 w-[80px] text-right">
                {m.decision ? (
                  <span className="text-[11px] text-muted capitalize">{m.decision}</span>
                ) : (
                  <span className="text-[11px] text-muted-more">—</span>
                )}
              </div>

              <div className="shrink-0 w-[80px] text-right">
                <RelativeTime date={m.updated_at} />
              </div>

              <div className="shrink-0 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
