"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Clipboard,
  Plus,
  Folder,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { listMatters } from "../matters/api";
import type { MatterSummary } from "../matters/types";
import { StatusDot } from "../internal/cases/_components/status-dot";
import { RelativeTime } from "../internal/cases/_components/relative-time";
import { CopyButton } from "../_components/ui/copy-button";
import { FilterSelect } from "../_components/ui/filter-chip";
import { Sparkline } from "../_components/sparkline";

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{count}</span>;
}

export default function DashboardPage() {
  const [matters, setMatters] = useState<MatterSummary[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    listMatters().then(setMatters).catch(() => {});
  }, []);

  const clearCount = matters.filter((m) => m.decision === "clear").length;
  const reviewCount = matters.filter((m) => m.decision === "review").length;
  const stopCount = matters.filter((m) => m.decision === "stop").length;
  const pendingCount = matters.filter((m) => m.customer_status === "submitted").length;

  // Mock sparkline data
  const clearTrend = [12, 15, 13, 18, 20, 22, 25, 23, 28, 30, 32, 35];
  const reviewTrend = [8, 10, 12, 9, 11, 13, 10, 14, 12, 15, 13, 16];
  const stopTrend = [2, 3, 2, 4, 3, 5, 4, 3, 5, 4, 6, 5];

  const recentMatter = matters[0];

  const statusFilters = [
    { key: "clear", label: "Clear", icon: <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#4ade80" }} /> },
    { key: "review", label: "Review", icon: <AlertCircle className="h-3.5 w-3.5" style={{ color: "#fbbf24" }} /> },
    { key: "stop", label: "Stop", icon: <XCircle className="h-3.5 w-3.5" style={{ color: "#ef4444" }} /> },
    { key: "submitted", label: "Pending", icon: <Clock className="h-3.5 w-3.5" style={{ color: "#a1a1aa" }} /> },
  ];

  const filteredMatters =
    activeFilters.length > 0
      ? matters.filter((m) => activeFilters.includes(m.decision ?? m.customer_status))
      : matters;

  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10 animate-slide-in">
      {/* Hero Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[32px] font-bold tracking-[-0.03em] text-foreground">Dashboard</h1>
            <p className="text-[14px] text-muted mt-1">Overview of your verification activity</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4ade80]" />
            </span>
            <span className="text-[11px] text-muted font-medium">System operational</span>
          </div>
        </div>
      </div>

      {/* Stats Row with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatCard
          label="Clear"
          value={clearCount}
          color="#4ade80"
          trend={clearTrend}
          subtitle="Ready for lodgement"
        />
        <StatCard
          label="Review"
          value={reviewCount}
          color="#fbbf24"
          trend={reviewTrend}
          subtitle="Need attention"
        />
        <StatCard
          label="Stop"
          value={stopCount}
          color="#ef4444"
          trend={stopTrend}
          subtitle="Blockers found"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          color="#a1a1aa"
          trend={[2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 2, pendingCount]}
          subtitle="Awaiting check"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Matters List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold">Recent Matters</h2>
              <Link href="/matters" className="text-[12px] text-muted hover:text-foreground transition-colors">
                View all {matters.length} matters
              </Link>
            </div>

            <div className="mb-4">
              <FilterSelect
                filters={statusFilters}
                activeFilters={activeFilters}
                onSelect={(key) => setActiveFilters((prev) => [...prev, key])}
                onRemove={(key) => setActiveFilters((prev) => prev.filter((k) => k !== key))}
                placeholder="Filter by status"
              />
            </div>

            {filteredMatters.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-1">
                {filteredMatters.slice(0, 5).map((m) => (
                  <Link
                    key={m.id}
                    href={`/matters/${m.id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-border/40"
                  >
                    <div className="shrink-0 w-[90px]">
                      <StatusDot status={m.customer_status === "submitted" ? "open" : m.customer_status === "in_review" ? "in_review" : m.customer_status === "resolved" ? "resolved" : "reopened"} pulse={m.customer_status === "submitted"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-mono text-muted-more tabular-nums tracking-tight">{m.case_reference}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <CopyButton value={m.case_reference} />
                        </span>
                      </div>
                      <p className="text-[13px] text-foreground/90 font-medium truncate">{m.property_description}</p>
                      <p className="text-[11px] text-muted truncate">{m.locality_or_area}</p>
                    </div>
                    {m.decision && (
                      <div className="hidden sm:block shrink-0 text-right w-[60px]">
                        <span className="text-[11px] capitalize" style={{ color: m.decision === "clear" ? "#4ade80" : m.decision === "stop" ? "#ef4444" : "#fbbf24" }}>
                          {m.decision}
                        </span>
                      </div>
                    )}
                    <div className="shrink-0 w-[70px] text-right">
                      <RelativeTime date={m.updated_at} />
                    </div>
                    <div className="shrink-0 w-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-3.5 w-3.5 text-muted" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Recent Matters</h2>
            <div className="space-y-0">
              {matters.slice(0, 4).map((m) => (
                <Link key={m.id} href={`/matters/${m.id}`} className="flex gap-3 relative py-2 group">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted z-10">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.decision === "clear" ? "#4ade80" : m.decision === "stop" ? "#ef4444" : "#fbbf24" }} />
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-[13px] text-foreground/80 truncate">{m.property_description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted capitalize">{m.customer_status.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-muted">·</span>
                      <span className="text-[11px] text-muted-more"><RelativeTime date={m.updated_at} /></span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[10px] font-mono text-muted-more">{m.case_reference}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionButton href="/matters/new" icon={Plus} label="New Clear-to-Lodge Check" desc="Verify a property" />
              <QuickActionButton href="/matters" icon={Folder} label="Browse All Matters" desc="Review history" />
            </div>
          </div>

          {/* Latest Decision */}
          {recentMatter?.decision && (
            <div
              className="border rounded-2xl p-5"
              style={{
                borderColor: recentMatter.decision === "clear" ? "rgba(74,222,128,0.2)" : recentMatter.decision === "stop" ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.2)",
                backgroundColor: recentMatter.decision === "clear" ? "rgba(74,222,128,0.04)" : recentMatter.decision === "stop" ? "rgba(239,68,68,0.04)" : "rgba(251,191,36,0.04)",
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-3">Latest Decision</p>
              <div className="flex items-center gap-3 mb-2">
                <DecisionIcon decision={recentMatter.decision} />
                <div>
                  <p className="text-[18px] font-bold" style={{ color: recentMatter.decision === "clear" ? "#4ade80" : recentMatter.decision === "stop" ? "#ef4444" : "#fbbf24" }}>
                    {recentMatter.decision === "clear" ? "Clear" : recentMatter.decision === "stop" ? "Stop" : "Review"}
                  </p>
                  <p className="text-[12px] text-muted">{recentMatter.property_description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted">
                {recentMatter.decision && <span>Decision: <span className="text-foreground/70 font-medium capitalize">{recentMatter.decision}</span></span>}
                <RelativeTime date={recentMatter.updated_at} />
              </div>
            </div>
          )}

          {/* Usage */}
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-muted">Checks this month</span>
                  <span className="text-foreground font-medium">{matters.length} / 50</span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((matters.length / 50) * 100, 100)}%`, backgroundColor: "#4ade80" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
                <div>
                  <p className="text-[20px] font-bold text-foreground">{matters.length}</p>
                  <p className="text-[11px] text-muted">Total checks</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-foreground">{Math.round((clearCount / Math.max(matters.length, 1)) * 100)}%</p>
                  <p className="text-[11px] text-muted">Clear rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, trend, subtitle }: { label: string; value: number; color: string; trend: number[]; subtitle: string }) {
  return (
    <div className="border border-border rounded-2xl bg-card/20 p-5 hover:border-border/60 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">{label}</p>
          <p className="text-[32px] font-bold tracking-[-0.03em] mt-1" style={{ color }}>
            <AnimatedCounter value={value} />
          </p>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
        </div>
        <Sparkline data={trend} color={color} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30">
        <Clipboard className="h-[22px] w-[22px] text-muted" />
      </div>
      <p className="text-[15px] text-foreground/80 mb-1 font-medium">No matters yet</p>
      <p className="text-[13px] text-muted max-w-[240px]">Run your first Clear-to-Lodge check to get started</p>
    </div>
  );
}

function QuickActionButton({ href, icon: Icon, label, desc }: { href: string; icon: any; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/30 hover:bg-white/[0.03] hover:border-border/60 transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors text-foreground">
        <Icon />
      </div>
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted">{desc}</p>
      </div>
    </Link>
  );
}

function DecisionIcon({ decision }: { decision: string }) {
  const color = decision === "clear" ? "#4ade80" : decision === "stop" ? "#ef4444" : "#fbbf24";
  const Icon = decision === "clear" ? Check : decision === "stop" ? X : AlertTriangle;
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
      <Icon size={18} color={color} strokeWidth={2.5} />
    </div>
  );
}
