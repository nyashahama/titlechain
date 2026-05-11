"use client";

import { Zap } from "lucide-react";
import { RunSummary } from "../types";
import { PipelineSwimlane } from "@/app/_components/pipeline-swimlane";
import { LogViewer } from "@/app/_components/log-viewer";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { StateView } from "@/app/_components/product/StateView";
import { getRunStatusMeta } from "@/app/_lib/product/status";

export function RunList({ runs }: { runs: RunSummary[] | null }) {
  if (!runs || runs.length === 0) {
    return (
      <StateView
        kind="empty"
        title="No runs found"
        description="Trigger a property sync to start the first projection run."
        className="rounded-lg border border-tc-border bg-tc-surface"
      />
    );
  }

  return (
    <div className="space-y-2">
      {runs.map((r) => {
        const status = getRunStatusMeta(r.status);

        return (
          <ProductPanel key={r.id} className="transition-colors hover:border-tc-border-strong">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Zap className="size-4 text-tc-text-faint" />
                  <span className="text-[13px] font-medium text-tc-text">{r.run_type}</span>
                  <ProductStatusBadge label={status.label} tone={status.tone} />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-tc-text-faint">
                  <span>{r.completed_jobs}/{r.total_jobs} jobs</span>
                  {r.failed_jobs > 0 ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-tc-danger">{r.failed_jobs} failed</span>
                    </>
                  ) : null}
                  {r.latest_error ? (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="max-w-[240px] truncate">{r.latest_error}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0 text-right">
                {r.started_at ? <div><RelativeTime date={r.started_at} /></div> : null}
                {r.finished_at ? (
                  <div className="mt-1 text-[11px] text-tc-text-faint">
                    done <RelativeTime date={r.finished_at} />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-3">
              <PipelineSwimlane status={r.status} />
            </div>
            <LogViewer logs={r.logs ?? []} />
          </ProductPanel>
        );
      })}
    </div>
  );
}
