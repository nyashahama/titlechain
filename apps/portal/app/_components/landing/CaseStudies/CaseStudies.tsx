"use client";

import { useState } from "react";
import { CaseStudyCard } from "./CaseStudyCard";

const studies = [
  {
    name: "VDM Attorneys",
    title: "Senior conveyancing firm, Johannesburg",
    description:
      "TitleChain reduced our title verification time from 3 days to under 30 minutes. The Clear-to-Lodge score gives our team instant confidence on every matter.",
  },
  {
    name: "Standard Bank Home Loans",
    title: "Major South African bank",
    description:
      "Integrating TitleChain's risk engine into our bond origination process reduced fraudulent applications by 67% while speeding up legitimate approvals.",
  },
  {
    name: "Cliffe Dekker Hofmeyr",
    title: "Full-service law firm",
    description:
      "The coverage across all deeds offices is remarkable. We process over 200 matters a month, and TitleChain catches issues we would have missed in manual reviews.",
  },
];

export function CaseStudies() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container py-20">
      <h2 className="mx-auto mb-12 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
        Trusted by industry leaders
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
