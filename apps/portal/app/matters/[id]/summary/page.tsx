"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileCheck2, Printer } from "lucide-react";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { StateView } from "@/app/_components/product/StateView";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { getDecisionMeta, getEvidenceStatusMeta, getMatterStatusMeta } from "@/app/_lib/product/status";
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
      <ProductPage className="max-w-4xl">
        <StateView kind="loading" title="Preparing summary" description="Generating the exportable matter report." />
      </ProductPage>
    );
  }

  if (error || !export_) {
    return (
      <ProductPage className="max-w-4xl">
        <StateView kind="error" title="Summary unavailable" description={error || "This matter summary could not be loaded."} />
      </ProductPage>
    );
  }

  const matter = export_.matter.summary;
  const evidence = export_.matter.evidence ?? [];
  const reasons = export_.matter.reasons ?? [];
  const decision = getDecisionMeta(matter.decision);
  const status = getMatterStatusMeta(matter.customer_status);

  return (
    <ProductPage className="max-w-4xl print:max-w-none print:px-0 print:py-0">
      <div className="mb-2 flex items-center justify-between print:hidden">
        <Link
          href={`/matters/${params.id}`}
          className="inline-flex items-center gap-2 text-[13px] text-tc-text-muted transition-colors hover:text-tc-text"
        >
          <ArrowLeft className="size-4" />
          Back to matter
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-tc-accent px-3 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-85 print:hidden"
        >
          <Printer className="size-4" />
          Print
        </button>
      </div>

      <ProductPanel className="p-8 print:border-0 print:bg-transparent print:p-0">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg border border-tc-border bg-tc-surface-subtle text-tc-text-muted print:hidden">
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-tc-text">Clear-to-Lodge Summary</h1>
            <p className="text-[12px] text-tc-text-muted">TitleChain Verification Report</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Case Reference</p>
              <p className="font-mono text-sm text-tc-text">{matter.case_reference}</p>
            </div>
            {matter.customer_reference && (
              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Customer Reference</p>
                <p className="text-sm text-tc-text">{matter.customer_reference}</p>
              </div>
            )}
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Status</p>
              <ProductStatusBadge label={status.label} tone={status.tone} />
            </div>
            {matter.decision ? (
              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Decision</p>
                <ProductStatusBadge label={decision.label} tone={decision.tone} />
              </div>
            ) : null}
          </div>

          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Property</p>
            <p className="text-sm font-medium text-tc-text">{matter.property_description}</p>
            <p className="text-[13px] text-tc-text-muted">
              {matter.locality_or_area} · {matter.municipality_or_deeds_office}
            </p>
          </div>

          {matter.title_reference && (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Title Reference</p>
              <p className="font-mono text-sm text-tc-text">{matter.title_reference}</p>
            </div>
          )}

          {evidence.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">
                Evidence ({evidence.length} items)
              </p>
              <div className="space-y-3">
                {evidence.map((e, i) => (
                  <div key={i} className="rounded-lg border border-tc-border bg-white/[0.03] p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-tc-text">{e.type}</span>
                      <ProductStatusBadge {...getEvidenceStatusMeta(e.status)} />
                    </div>
                    <p className="text-[12px] text-tc-text-muted">{e.excerpt || e.source_reference}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reasons.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Reasons</p>
              <div className="space-y-1.5">
                {reasons.map((r) => (
                  <div key={r.code} className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-tc-text-faint">{r.code}</span>
                    <span className="text-[12px] text-tc-text-muted">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-tc-text-faint">Generated</p>
            <p className="text-[13px] text-tc-text-muted">{new Date(export_.generated_at).toLocaleString()}</p>
          </div>

          <div className="mt-6 border-t border-tc-border pt-4">
            <p className="text-[11px] italic leading-relaxed text-tc-text-faint">{export_.disclaimer}</p>
          </div>
        </div>
      </ProductPanel>
    </ProductPage>
  );
}
