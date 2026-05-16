"use client";

import { cn } from "@/app/_lib/cn";

interface CaseStudyCardProps {
  name: string;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function CaseStudyCard({
  name,
  title,
  description,
  isOpen,
  onToggle,
}: CaseStudyCardProps) {
  return (
    <div
      className={cn(
        "group cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.035] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.055]",
        isOpen && "border-indigo-400/35 bg-indigo-500/[0.07]"
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-display text-base font-medium text-white">{name}</h4>
          <p className="mt-0.5 text-xs text-white/45">{title}</p>
        </div>
        <span
          className={cn(
            "mt-1 text-xs text-white/30 transition-transform",
            isOpen && "rotate-180"
          )}
        >
          &#9660;
        </span>
      </div>
      {isOpen && (
        <p className="mt-4 text-sm text-white/60 leading-relaxed animate-fade-in">
          {description}
        </p>
      )}
    </div>
  );
}
