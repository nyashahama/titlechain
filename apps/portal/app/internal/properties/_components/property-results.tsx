"use client";

import { PropertySummary } from "../types";
import Link from "next/link";

export function PropertyResults({ properties }: { properties: PropertySummary[] | null }) {
  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center mb-5 bg-card/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
        </div>
        <p className="text-[15px] text-foreground/80 mb-1.5 font-medium">No properties found</p>
        <p className="text-[13px] text-muted max-w-[240px]">Try adjusting your search criteria or sync properties from the runs page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {properties.map((p, i) => {
        const params = new URLSearchParams({
          seed_property_id: p.property_id,
          property_description: p.property_description,
          locality_or_area: p.locality_or_area,
          municipality_or_deeds_office: p.municipality_or_deeds_office,
          title_reference: p.title_reference,
        });
        return (
          <div
            key={p.property_id}
            className="bg-card border border-border rounded-2xl p-5 transition-all duration-200 hover:border-border-light/60"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground font-medium">{p.property_description}</p>
                <p className="text-[11px] text-muted mt-1">{p.locality_or_area} · {p.municipality_or_deeds_office}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-muted-more">{p.title_reference}</span>
                  <span className="text-[11px] text-muted-more">·</span>
                  <span className="text-[11px] text-muted-more">{p.current_owner_name}</span>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="text-[11px] uppercase tracking-[0.05em] text-muted">{p.status}</span>
                <Link
                  href={`/internal/cases/new?${params.toString()}`}
                  className="text-[11px] font-medium text-foreground/80 hover:text-foreground transition-colors duration-200 underline underline-offset-2 decoration-border-light hover:decoration-foreground"
                >
                  Open Case
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}