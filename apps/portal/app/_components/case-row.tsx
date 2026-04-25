"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CaseSummary } from "@/app/internal/cases/types";
import { listItem } from "@/app/_lib/animations";
import { Badge } from "./ui/badge";
import { CopyButton } from "@/app/internal/cases/_components/copy-button";
import { RelativeTime } from "@/app/internal/cases/_components/relative-time";
import { Avatar } from "@/app/internal/cases/_components/avatar";

interface CaseRowProps {
  caseItem: CaseSummary;
  index: number;
  analystMap: Map<string, string>;
}

export function CaseRow({ caseItem, index, analystMap }: CaseRowProps) {
  const assigneeName = analystMap.get(caseItem.assignee_id) ?? caseItem.assignee_id;

  return (
    <motion.div variants={listItem}>
      <Link
        href={`/internal/cases/${caseItem.id}`}
        className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
      >
        <div className="shrink-0 w-[100px]">
          <Badge status={caseItem.status} pulse={caseItem.status === "open" || caseItem.status === "reopened"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">
              {caseItem.case_reference}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <CopyButton text={caseItem.case_reference} />
            </span>
          </div>
          <p className="text-[13px] text-foreground/90 font-medium truncate">{caseItem.property_description}</p>
          <p className="text-[11px] text-muted truncate">{caseItem.locality_or_area} · {caseItem.municipality_or_deeds_office}</p>
          {caseItem.pilot ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
              <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 font-medium text-sky-200">
                Pilot customer
              </span>
              <span className="truncate">{caseItem.pilot.organization_name}</span>
              {caseItem.pilot.customer_reference ? (
                <span className="font-mono text-muted-more">{caseItem.pilot.customer_reference}</span>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0 w-[140px]">
          <Avatar name={assigneeName} size={20} />
          <span className="text-[12px] text-muted truncate">{assigneeName}</span>
        </div>

        <div className="shrink-0 w-[80px] text-right">
          <RelativeTime date={caseItem.updated_at} />
        </div>

        <div className="shrink-0 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
