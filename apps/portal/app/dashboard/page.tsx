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
    <div className="p-8 md:p-10 max-w-5xl animate-slide-in">
      <div className="mb-10">
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground">Dashboard</h1>
        <p className="text-[14px] text-muted mt-1.5">Overview of your Clear-to-Lodge activity</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Clear" value={clearCount} color="#4ade80" glow="rgba(74,222,128,0.12)" />
        <StatCard label="Review" value={reviewCount} color="#fbbf24" glow="rgba(251,191,36,0.12)" />
        <StatCard label="Stop" value={stopCount} color="#ef4444" glow="rgba(239,68,68,0.12)" />
        <StatCard label="Pending" value={pendingCount} color="#a1a1aa" glow="rgba(161,161,170,0.12)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Recent Matters */}
        <div className="border border-border rounded-2xl bg-card/20 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold">Recent Matters</h2>
            <Link href="/matters" className="text-[12px] text-muted hover:text-foreground transition-colors duration-200">
              View all
            </Link>
          </div>

          {matters.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-4 mx-auto">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-[15px] text-foreground/80 font-medium mb-1">No matters yet</p>
              <p className="text-[13px] text-muted">Run your first Clear-to-Lodge check</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {matters.slice(0, 6).map((m) => (
                <Link
                  key={m.id}
                  href={`/matters/${m.id}`}
                  className="group flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
                >
                  <div className="shrink-0 w-[90px]">
                    <StatusDot status={m.status} pulse={m.status === "pending"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground/90 font-medium truncate">{m.property_description}</p>
                    <p className="text-[11px] text-muted truncate">{m.locality_or_area} · {m.reference}</p>
                  </div>
                  <div className="shrink-0">
                    <RelativeTime date={m.updated_at} />
                  </div>
                  <div className="shrink-0 w-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/matters/new"
            className="group flex items-center gap-4 p-5 border border-border rounded-2xl bg-card/20 hover:bg-white/[0.03] transition-all duration-200 hover:border-border/60"
          >
            <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-border/40 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">New Clear-to-Lodge Check</p>
              <p className="text-[12px] text-muted mt-0.5">Verify a property before lodgement</p>
            </div>
          </Link>

          <Link
            href="/matters"
            className="group flex items-center gap-4 p-5 border border-border rounded-2xl bg-card/20 hover:bg-white/[0.03] transition-all duration-200 hover:border-border/60"
          >
            <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-border/40 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-medium text-foreground">Browse All Matters</p>
              <p className="text-[12px] text-muted mt-0.5">Review history and evidence</p>
            </div>
          </Link>

          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-muted">Checks this month</span>
                  <span className="text-foreground font-medium">{matters.length} / 50</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((matters.length / 50) * 100, 100)}%`, backgroundColor: "#4ade80" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-muted">Plan</span>
                  <span className="text-foreground font-medium">Starter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, glow }: { label: string; value: number; color: string; glow: string }) {
  return (
    <div className="border border-border rounded-2xl bg-card/20 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ backgroundColor: glow }} />
      <p className="text-[32px] font-bold tracking-[-0.03em]" style={{ color }}>{value}</p>
      <p className="text-[11px] text-muted uppercase tracking-[0.1em] font-medium mt-1">{label}</p>
    </div>
  );
}
