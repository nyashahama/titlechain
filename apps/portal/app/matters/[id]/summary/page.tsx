"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createSummary, getMatterDetail } from "../../api";
import type { SummaryExport } from "../../types";

export default function SummaryPage() {
  const params = useParams();
  const [export_, setExport] = useState<SummaryExport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const exp = await createSummary(params.id as string);
        setExport(exp);
      } catch {
        try {
          const detail = await getMatterDetail(params.id as string);
          setExport({
            matter: detail,
            generated_at: new Date().toISOString(),
            disclaimer: "TitleChain provides verification support, not legal advice or a deeds-office guarantee.",
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load summary");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-10">
        <div className="flex items-center justify-center py-28">
          <svg className="animate-spin h-6 w-6 text-muted" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !export_) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-10">
        <p className="text-muted">{error || "Summary not available"}</p>
      </div>
    );
  }

  const matter = export_.matter.summary;
  const decisionColor = matter.decision === "clear" ? "#4ade80" : matter.decision === "stop" ? "#ef4444" : matter.decision === "review" ? "#fbbf24" : undefined;

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link
          href={`/matters/${params.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-200 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to matter
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80 print:hidden"
        >
          Print
        </button>
      </div>

      <div className="border border-border rounded-2xl bg-card/20 p-8 print:border-0 print:bg-transparent print:p-0">
        <div className="flex items-center gap-3 mb-8">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-foreground">
            <path d="M16 2L30 28H2L16 2Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <div>
            <h1 className="text-[20px] font-bold tracking-[-0.03em] text-foreground">Clear-to-Lodge Summary</h1>
            <p className="text-[12px] text-muted">TitleChain Verification Report</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Case Reference</p>
              <p className="text-[14px] font-mono text-foreground/90">{matter.case_reference}</p>
            </div>
            {matter.customer_reference && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Customer Reference</p>
                <p className="text-[14px] text-foreground/90">{matter.customer_reference}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Status</p>
              <p className="text-[14px] text-foreground/90 capitalize">{matter.customer_status.replace(/_/g, " ")}</p>
            </div>
            {matter.decision && decisionColor && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Decision</p>
                <p className="text-[14px] font-bold" style={{ color: decisionColor }}>{matter.decision}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Property</p>
            <p className="text-[14px] text-foreground/90 font-medium">{matter.property_description}</p>
            <p className="text-[13px] text-muted">{matter.locality_or_area} · {matter.municipality_or_deeds_office}</p>
          </div>

          {matter.title_reference && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Title Reference</p>
              <p className="text-[14px] font-mono text-foreground/90">{matter.title_reference}</p>
            </div>
          )}

          {export_.matter.evidence.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-3">Evidence ({export_.matter.evidence.length} items)</p>
              <div className="space-y-3">
                {export_.matter.evidence.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-border/30">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-semibold text-foreground/80">{e.type}</span>
                      <span className="text-[10px] text-muted uppercase">{e.status}</span>
                    </div>
                    <p className="text-[12px] text-foreground/60">{e.excerpt || e.source_reference}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {export_.matter.reasons.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-3">Reasons</p>
              <div className="space-y-1.5">
                {export_.matter.reasons.map((r) => (
                  <div key={r.code} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-more">{r.code}</span>
                    <span className="text-[12px] text-foreground/80">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1">Generated</p>
            <p className="text-[13px] text-foreground/80">{new Date(export_.generated_at).toLocaleString()}</p>
          </div>

          <div className="border-t border-border/30 pt-4 mt-6">
            <p className="text-[11px] text-muted-more italic leading-relaxed">{export_.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
