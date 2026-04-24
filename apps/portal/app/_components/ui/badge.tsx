"use client";

import { motion } from "framer-motion";

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

interface BadgeProps {
  status: string;
  pulse?: boolean;
  className?: string;
}

export function Badge({ status, pulse = false, className = "" }: BadgeProps) {
  const style = statusStyles[status] || statusStyles.open;
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium capitalize ${className}`}
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
