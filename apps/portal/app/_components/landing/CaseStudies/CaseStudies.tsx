"use client";

import { useState } from "react";
import { CaseStudyCard } from "./CaseStudyCard";

const studies = [
  {
    name: "Conveyancing firm pilot",
    title: "High-volume transfer team",
    description:
      "Clear-to-Lodge condenses registry, bond, municipal, and FIC signals into a review pack a senior conveyancer can approve without rebuilding the evidence trail.",
  },
  {
    name: "Bank lending workflow",
    title: "Bond origination and risk review",
    description:
      "Risk states separate clear matters from review and stop exceptions before lodgement, giving credit teams a consistent title-readiness checkpoint.",
  },
  {
    name: "Enterprise legal operations",
    title: "Matter control and audit readiness",
    description:
      "Role-based matter access, exportable evidence snapshots, and POPIA-aware handling keep title decisions defensible across distributed legal teams.",
  },
];

export function CaseStudies() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container py-20">
      <h2 className="mx-auto mb-12 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
        Designed for regulated property teams
      </h2>
      <div className="mx-auto max-w-3xl space-y-4">
        {studies.map((study, i) => (
          <CaseStudyCard
            key={study.name}
            {...study}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}
