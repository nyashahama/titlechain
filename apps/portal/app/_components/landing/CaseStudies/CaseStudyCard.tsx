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
        "group cursor-pointer rounded-2xl border border-white/[0.06] bg-[hsl(0_0%_4%)] p-6 transition-all hover:border-white/[0.12]",
        isOpen && "border-orange-500/30 bg-[hsl(0_0%_6%)]"
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">{name}</h4>
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
