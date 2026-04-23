import { CaseSummary } from "../types";
import Link from "next/link";

function StatusBadge({ status }: { status: CaseSummary["status"] }) {
  const configs: Record<string, { label: string; color: string; glow: string }> = {
    open: { label: "Open", color: "#a1a1aa", glow: "rgba(161,161,170,0.15)" },
    in_review: { label: "In Review", color: "#fbbf24", glow: "rgba(251,191,36,0.15)" },
    resolved: { label: "Resolved", color: "#4ade80", glow: "rgba(74,222,128,0.15)" },
    closed_unresolved: { label: "Unresolved", color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
    reopened: { label: "Reopened", color: "#60a5fa", glow: "rgba(96,165,250,0.15)" },
  };
  const cfg = configs[status] ?? configs.open;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide"
      style={{
        color: cfg.color,
        backgroundColor: `${cfg.glow}`,
        border: `1px solid ${cfg.glow}`,
      }}
    >
      {cfg.label}
    </span>
  );
}

export function CaseQueue({ cases }: { cases: CaseSummary[] | null }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-[15px] text-foreground/80 mb-1">No cases found</p>
        <p className="text-[13px] text-muted">Create a new case to get started</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-card/50">
            <th className="text-left text-[11px] uppercase tracking-[0.1em] text-muted font-medium px-5 py-3">Reference</th>
            <th className="text-left text-[11px] uppercase tracking-[0.1em] text-muted font-medium px-5 py-3">Property</th>
            <th className="text-left text-[11px] uppercase tracking-[0.1em] text-muted font-medium px-5 py-3">Status</th>
            <th className="text-left text-[11px] uppercase tracking-[0.1em] text-muted font-medium px-5 py-3">Assignee</th>
            <th className="text-right text-[11px] uppercase tracking-[0.1em] text-muted font-medium px-5 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr
              key={c.id}
              className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-5 py-3.5">
                <Link
                  href={`/internal/cases/${c.id}`}
                  className="text-[13px] font-medium text-foreground hover:text-muted transition-colors"
                >
                  {c.case_reference}
                </Link>
              </td>
              <td className="px-5 py-3.5">
                <p className="text-[13px] text-foreground/80 truncate max-w-[280px]">{c.property_description}</p>
                <p className="text-[11px] text-muted mt-0.5">{c.locality_or_area}</p>
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={c.status} />
              </td>
              <td className="px-5 py-3.5">
                <span className="text-[13px] text-muted">{c.assignee_id}</span>
              </td>
              <td className="px-5 py-3.5 text-right">
                <span className="text-[12px] text-muted-more">
                  {new Date(c.updated_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
