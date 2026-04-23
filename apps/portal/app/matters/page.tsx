import Link from "next/link";
import { listMatters } from "../_lib/mock-data";
import { StatusDot } from "../internal/cases/_components/status-dot";
import { RelativeTime } from "../internal/cases/_components/relative-time";

export default function MattersPage() {
  const matters = listMatters();

  return (
    <div className="p-6 md:p-10 max-w-5xl animate-slide-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.03em] text-foreground">Matters</h1>
          <p className="text-[13px] text-muted mt-1">All your Clear-to-Lodge checks</p>
        </div>
        <Link
          href="/matters/new"
          className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80"
        >
          New Check
        </Link>
      </div>

      <div className="border border-border rounded-2xl bg-card/20 overflow-hidden">
        {matters.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30 mx-auto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[15px] text-foreground/80 mb-1.5 font-medium">No matters yet</p>
            <p className="text-[13px] text-muted max-w-[240px] mx-auto">Create your first Clear-to-Lodge check to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {matters.map((m) => (
              <Link
                key={m.id}
                href={`/matters/${m.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-white/[0.02]"
              >
                <div className="shrink-0 w-[100px]">
                  <StatusDot status={m.status} pulse={m.status === "pending"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-foreground/90 font-medium truncate">{m.property_description}</p>
                  <p className="text-[11px] text-muted truncate">{m.locality_or_area} · {m.municipality_or_deeds_office}</p>
                </div>
                <div className="hidden md:block shrink-0 w-[100px] text-right">
                  <span className="text-[11px] font-mono text-muted-more">{m.reference}</span>
                </div>
                <div className="shrink-0 w-[80px] text-right">
                  <RelativeTime date={m.updated_at} />
                </div>
                <div className="shrink-0 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
