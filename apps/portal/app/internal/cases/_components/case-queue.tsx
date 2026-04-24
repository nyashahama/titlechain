"use client";

import { motion } from "framer-motion";
import { CaseSummary } from "../types";
import { staggerContainer } from "@/app/_lib/animations";
import { CaseRow } from "@/app/_components/case-row";

export function CaseQueue({ cases, analystMap }: { cases: CaseSummary[] | null; analystMap: Map<string, string> }) {
  if (!cases || cases.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="space-y-1"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {cases.map((c, i) => (
        <CaseRow key={c.id} caseItem={c} index={i} analystMap={analystMap} />
      ))}
    </motion.div>
  );
}
