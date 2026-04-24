"use client";

import { RunSummary } from "../types";
import { RelativeTime } from "../../../cases/_components/relative-time";

export function RunList({ runs }: { runs: RunSummary[] | null }) {
  if (!runs || runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-[15px] text-foreground/80 mb-1.5 font-medium">No runs found</p>
        <p className="text-[13px] text-muted max-w-[240px]">Trigger a property sync to start your first projection run.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {runs.map((r, i) => (
        <div
          key={r.id}
          className="bg-card border border-border rounded-2xl p-5 transition-all duration-200 hover:border-border-light/60"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] text-foreground font-medium">{r.run_type}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${
                  r.status === "completed"
                    ? "text-[#4ade80] bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.15)]"
                    : r.status === "failed"
                    ? "text-[#ef4444] bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.15)]"
                    : "text-[#fbbf24] bg-[rgba(251,191,36,0.15)] border border-[rgba(251,191,36,0.15)]"
                }`}>
                  {r.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-more">
                <span>{r.completed_jobs}/{r.total_jobs} jobs</span>
                {r.failed_jobs > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-[#ef4444]">{r.failed_jobs} failed</span>
                  </>
                )}
                {r.latest_error && (
                  <>
                    <span>·</span>
                    <span className="truncate max-w-[200px]">{r.latest_error}</span>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {r.started_at && <div className="text-[11px] text-muted-more"><RelativeTime date={r.started_at} /></div>}
              {r.finished_at && <div className="text-[11px] text-muted-more mt-0.5">done <RelativeTime date={r.finished_at} /></div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}