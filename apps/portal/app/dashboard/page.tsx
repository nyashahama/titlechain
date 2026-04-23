import Link from "next/link";
import { listMatters } from "../_lib/mock-data";
import { StatusDot } from "../internal/cases/_components/status-dot";
import { RelativeTime } from "../internal/cases/_components/relative-time";

export default function DashboardPage() {
  const matters = listMatters();
  const clearCount = matters.filter((m) => m.decision === "clear").length;
  const reviewCount = matters.filter((m) => m.decision === "review").length;
  const stopCount = matters.filter((m) => m.decision === "stop").length;
  const pendingCount = matters.filter((m) => m.status === "pending").length;

  return (
    <div className="p-6 md:p-10 max-w-5xl animate-slide-in">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-[-0.03em] text-foreground">Dashboard</h1>
        <p className="text-[13px] text-muted mt-1">Overview of your verification activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Clear" value={clearCount} color="#4ade80" />
        <StatCard label="Review" value={reviewCount} color="#fbbf24" />
        <StatCard label="Stop" value={stopCount} color="#ef4444" />
        <StatCard label="Pending" value={pendingCount} color="#a1a1aa" />
      </div>

      {/* Recent Matters */}
      <div className="border border-border rounded-2xl bg-card/20 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold">Recent Matters</h2>
          <Link href="/matters" className="text-[12px] text-muted hover:text-foreground transition-colors">
            View all
          </Link>
        </div>

        {matters.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px] text-muted">No matters yet. Create your first Clear-to-Lodge check.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {matters.slice(0, 5).map((m) => (
              <Link
                key={m.id}
                href={`/matters/${m.id}`}
                className="group flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
              >
                <div className="shrink-0 w-[80px]">
                  <StatusDot status={m.status} pulse={m.status === "pending"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground/90 font-medium truncate">{m.property_description}</p>
                  <p className="text-[11px] text-muted truncate">{m.locality_or_area} · {m.reference}</p>
                </div>
                <div className="shrink-0">
                  <RelativeTime date={m.updated_at} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        <Link
          href="/matters/new"
          className="flex items-center gap-3 p-5 border border-border rounded-2xl bg-card/20 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">New Clear-to-Lodge Check</p>
            <p className="text-[11px] text-muted">Verify a property before lodgement</p>
          </div>
        </Link>
        <Link
          href="/matters"
          className="flex items-center gap-3 p-5 border border-border rounded-2xl bg-card/20 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">Browse All Matters</p>
            <p className="text-[11px] text-muted">Review history and evidence</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="border border-border rounded-2xl bg-card/20 p-4">
      <p className="text-[28px] font-bold tracking-[-0.03em]" style={{ color }}>{value}</p>
      <p className="text-[11px] text-muted uppercase tracking-wider font-medium mt-1">{label}</p>
    </div>
  );
}
