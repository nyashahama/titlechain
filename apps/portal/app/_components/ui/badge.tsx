"use client";

import { cn } from "@/app/_lib/cn";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  open: { bg: "rgba(59,130,246,0.10)", text: "#3b82f6", border: "rgba(59,130,246,0.20)" },
  in_review: { bg: "rgba(245,158,11,0.10)", text: "#f59e0b", border: "rgba(245,158,11,0.20)" },
  resolved: { bg: "rgba(34,197,94,0.10)", text: "#22c55e", border: "rgba(34,197,94,0.20)" },
  closed_unresolved: { bg: "rgba(239,68,68,0.10)", text: "#ef4444", border: "rgba(239,68,68,0.20)" },
  reopened: { bg: "rgba(168,85,247,0.10)", text: "#a855f7", border: "rgba(168,85,247,0.20)" },
  pending: { bg: "rgba(245,158,11,0.10)", text: "#f59e0b", border: "rgba(245,158,11,0.20)" },
  running: { bg: "rgba(59,130,246,0.10)", text: "#3b82f6", border: "rgba(59,130,246,0.20)" },
  completed: { bg: "rgba(34,197,94,0.10)", text: "#22c55e", border: "rgba(34,197,94,0.20)" },
  failed: { bg: "rgba(239,68,68,0.10)", text: "#ef4444", border: "rgba(239,68,68,0.20)" },
};

type BadgeVariant = "default" | "destructive" | "outline" | "secondary" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground border-transparent",
  destructive: "bg-destructive text-destructive-foreground border-transparent",
  outline: "bg-background text-foreground border-input",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  success: "bg-emerald-500/15 text-emerald-700 border-transparent",
  warning: "bg-amber-500/15 text-amber-700 border-transparent",
};

const variantDotColor: Record<BadgeVariant, string> = {
  default: "bg-primary-foreground",
  destructive: "bg-destructive-foreground",
  outline: "bg-foreground",
  secondary: "bg-secondary-foreground",
  success: "bg-emerald-600",
  warning: "bg-amber-600",
};

interface BadgeProps {
  variant?: BadgeVariant;
  status?: string;
  pulse?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Badge({ variant, status, pulse = false, className = "", children }: BadgeProps) {
  // Legacy status-based API
  if (status !== undefined) {
    const style = statusStyles[status] || statusStyles.open;
    const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium capitalize",
          className
        )}
        style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
      >
        {pulse && (
          <motion.span
            className="w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: style.text }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {!pulse && <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: style.text }} />}
        {label}
      </span>
    );
  }

  // New variant-based API
  const selectedVariant = variant ?? "default";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium capitalize border",
        variantClasses[selectedVariant],
        className
      )}
    >
      {pulse && (
        <motion.span
          className={cn("w-[6px] h-[6px] rounded-full", variantDotColor[selectedVariant])}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!pulse && <span className={cn("w-[6px] h-[6px] rounded-full", variantDotColor[selectedVariant])} />}
      {children}
    </span>
  );
}
