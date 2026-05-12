"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CaseSummary } from "@/app/internal/cases/types";
import { listItem } from "@/app/_lib/animations";
import { CopyAction } from "@/app/_components/product/CopyAction";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { evidenceReadinessTone } from "@/app/_lib/product/evidence-readiness";
import { getCaseStatusMeta } from "@/app/_lib/product/status";
import { caseEvidenceReadiness } from "@/app/internal/cases/case-readiness";
import { Avatar } from "@/app/internal/cases/_components/avatar";

interface CaseRowProps {
  caseItem: CaseSummary;
  index: number;
  analystMap: Map<string, string>;
}

export function CaseRow({ caseItem, index, analystMap }: CaseRowProps) {
  const assigneeName = analystMap.get(caseItem.assignee_id) ?? caseItem.assignee_id;
  const status = getCaseStatusMeta(caseItem.status);
  const readiness = caseEvidenceReadiness(caseItem.evidence_readiness);

  return (
    <motion.div variants={listItem}>
      <div className="group relative grid min-h-[92px] grid-cols-[100px_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-transparent px-4 py-3.5 transition-all duration-200 hover:border-tc-border hover:bg-white/[0.03] sm:grid-cols-[100px_minmax(0,1fr)_140px_80px_24px]">
        <Link
          href={`/internal/cases/${caseItem.id}`}
          className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tc-accent"
        >
          <span className="sr-only">Open case {caseItem.case_reference}</span>
        </Link>

        <div className="pointer-events-none relative z-10 shrink-0">
          <ProductStatusBadge label={status.label} tone={status.tone} />
        </div>

        <div className="pointer-events-none relative z-10 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">
              {caseItem.case_reference}
            </span>
            <span
              className="pointer-events-auto opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <CopyAction text={caseItem.case_reference} label={`Copy ${caseItem.case_reference}`} />
            </span>
          </div>
          <p className="text-[13px] text-foreground/90 font-medium truncate">{caseItem.property_description}</p>
          <p className="text-[11px] text-muted truncate">{caseItem.locality_or_area} · {caseItem.municipality_or_deeds_office}</p>
          <div className="mt-1 flex min-h-6 flex-wrap items-center gap-1.5">
            <ProductStatusBadge label={readiness.label} tone={evidenceReadinessTone(readiness.state)} />
          </div>
          {caseItem.pilot ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
              <span className="rounded-md border border-tc-info/30 bg-tc-info/10 px-2 py-0.5 font-medium text-tc-info">
                Pilot customer
              </span>
              <span className="truncate">{caseItem.pilot.organization_name}</span>
              {caseItem.pilot.customer_reference ? (
                <span className="font-mono text-muted-more">{caseItem.pilot.customer_reference}</span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="pointer-events-none relative z-10 hidden items-center gap-2 sm:flex">
          <Avatar name={assigneeName} size={20} />
          <span className="text-[12px] text-muted truncate">{assigneeName}</span>
        </div>

        <div className="pointer-events-none relative z-10 shrink-0 text-right">
          <RelativeTime date={caseItem.updated_at} />
        </div>

        <div className="pointer-events-none relative z-10 hidden shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
          <ChevronRight className="size-4 text-muted" />
        </div>
      </div>
    </motion.div>
  );
}
