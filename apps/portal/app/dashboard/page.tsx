import Link from "next/link";
import { listMatters } from "../_lib/mock-data";
import { StatusDot } from "../internal/cases/_components/status-dot";
import { RelativeTime } from "../internal/cases/_components/relative-time";
import { CopyButton } from "../internal/cases/_components/copy-button";

export default function DashboardPage() {
  const matters = listMatters();
  const clearCount = matters.filter((m) => m.decision === "clear").length;
  const reviewCount = matters.filter((m) => m.decision === "review").length;
  const stopCount = matters.filter((m) => m.decision === "stop").length;
  const pendingCount = matters.filter((m) => m.status === "pending").length;

  const statusLinks = [
    { label: "All", value: "" },
    { label: "Clear", value: "clear" },
    { label: "Review", value: "review" },
    { label: "Stop", value: "stop" },
    { label: "Pending", value: "pending" },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Dashboard</h1>
            <p className="text-[13px] text-muted mt-1">Overview of your Clear-to-Lodge checks</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/matters/new"
              className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
            >
              New Check
            </Link>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {statusLinks.map((sl) => {
            return (
              <Link
                key={sl.label}
                href={sl.value ? `/matters?status=${sl.value}` : "/matters"}
                className="px-3 py-[5px] rounded-full text-[12px] font-medium transition-all duration-200 text-muted hover:text-foreground hover:bg-white/[0.04]"
              >
                {sl.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Clear" value={clearCount} color="#4ade80" />
        <StatCard label="Review" value={reviewCount} color="#fbbf24" />
        <StatCard label="Stop" value={stopCount} color="#ef4444" />
        <StatCard label="Pending" value={pendingCount} color="#a1a1aa" />
      </div>

      {/* Recent Matters — Linear List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold">Recent Matters</h2>
          <Link href="/matters" className="text-[12px] text-muted hover:text-foreground transition-colors duration-200">
            View all
          </Link>
        </div>

        {matters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[15px] text-foreground/80 mb-1 font-medium">No matters yet</p>
            <p className="text-[13px] text-muted max-w-[240px]">Run your first Clear-to-Lodge check to get started.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {matters.slice(0, 6).map((m) => (
              <Link
                key={m.id}
                href={`/matters/${m.id}`}
                className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
              >
                <div className="shrink-0 w-[100px]">
                  <StatusDot status={m.status} pulse={m.status === "pending"} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">{m.reference}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <CopyButton text={m.reference} />
                    </span>
                  </div>
                  <p className="text-[13px] text-foreground/90 font-medium truncate">{m.property_description}</p>
                  <p className="text-[11px] text-muted truncate">{m.locality_or_area} · {m.municipality_or_deeds_office}</p>
                </div>
                <div className="shrink-0 w-[80px] text-right">
                  <RelativeTime date={m.updated_at} />
                </div>
                <div className="shrink-0 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Recent Activity</h2>
        <div className="border border-border rounded-2xl bg-card/20 p-5">
          <div className="space-y-0">
            {matters.slice(0, 5).flatMap((m) => m.audit_log.slice(0, 1)).map((log, i) => (
              <div key={`${log.id}-${i}`} className="flex gap-3 relative">
                {i < 4 && (
                  <div className="absolute left-[17px] top-7 bottom-0 w-px bg-border/40" />
                )}
                <div className="shrink-0 w-9 h-9 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted z-10">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="pb-4 pt-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-medium text-foreground/80">{log.event_type}</span>
                    <span className="text-muted">·</span>
                    <span className="text-[11px] text-muted">{log.actor_name}</span>
                  </div>
                  <RelativeTime date={log.created_at} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="border border-border rounded-2xl bg-card/20 p-4">
      <p className="text-[28px] font-bold tracking-[-0.03em]" style={{ color }}>{value}</p>
      <p className="text-[11px] text-muted uppercase tracking-[0.1em] font-medium mt-1">{label}</p>
    </div>
  );
}
