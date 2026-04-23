const statusConfig: Record<string, { label: string; color: string; glow: string }> = {
  open: { label: "Open", color: "#a1a1aa", glow: "rgba(161,161,170,0.15)" },
  in_review: { label: "In Review", color: "#fbbf24", glow: "rgba(251,191,36,0.15)" },
  resolved: { label: "Resolved", color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
  closed_unresolved: { label: "Unresolved", color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
  reopened: { label: "Reopened", color: "#60a5fa", glow: "rgba(96,165,250,0.15)" },
  candidate: { label: "Candidate", color: "#a1a1aa", glow: "rgba(161,161,170,0.15)" },
  confirmed: { label: "Confirmed", color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
  rejected: { label: "Rejected", color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
};

export function StatusDot({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const cfg = statusConfig[status] ?? statusConfig.open;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulse ? "animate-ping" : ""}`}
          style={{ backgroundColor: cfg.color }}
        />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: cfg.color }} />
      </span>
      <span className="text-[11px] font-medium" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.open;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide"
      style={{
        color: cfg.color,
        backgroundColor: cfg.glow,
        border: `1px solid ${cfg.glow}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

export { statusConfig };
