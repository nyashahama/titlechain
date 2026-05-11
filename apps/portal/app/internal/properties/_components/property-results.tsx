"use client";

import { PropertySummary } from "../types";
import Link from "next/link";
import { ExternalLink, Home } from "lucide-react";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import { RelativeTime } from "@/app/_components/product/RelativeTime";
import { StateView } from "@/app/_components/product/StateView";

export function PropertyResults({ properties }: { properties: PropertySummary[] | null }) {
  if (!properties || properties.length === 0) {
    return (
      <StateView
        kind="empty"
        title="No properties found"
        description="Adjust the search criteria or sync properties from the runs page."
        className="rounded-lg border border-tc-border bg-tc-surface"
      />
    );
  }

  return (
    <ProductPanel className="overflow-hidden p-0">
      <div className="divide-y divide-tc-border">
      {properties.map((p) => {
        const hasBlocker = p.status.toLowerCase().includes("blocker") && !p.status.toLowerCase().includes("no material");
        const params = new URLSearchParams({
          linked_property_id: p.property_id,
          property_description: p.property_description,
          locality_or_area: p.locality_or_area,
          municipality_or_deeds_office: p.municipality_or_deeds_office,
          title_reference: p.title_reference,
        });
        return (
          <div
            key={p.property_id}
            className="grid gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[minmax(0,1fr)_180px_150px_96px] md:items-center"
          >
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <Home className="size-4 shrink-0 text-tc-text-faint" />
                <p className="truncate text-[13px] font-medium text-tc-text">{p.property_description}</p>
              </div>
              <p className="truncate text-[12px] text-tc-text-muted">
                {p.locality_or_area} · {p.municipality_or_deeds_office}
              </p>
              <p className="mt-1 truncate text-[11px] text-tc-text-faint">{p.current_owner_name}</p>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[12px] text-tc-text">{p.title_reference || "No title ref"}</p>
              <RelativeTime date={p.updated_at} />
            </div>
            <div>
              <ProductStatusBadge label={hasBlocker ? "Blocker" : "No blocker"} tone={hasBlocker ? "danger" : "success"} />
            </div>
            <Link
              href={`/internal/cases/new?${params.toString()}`}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-tc-border bg-tc-surface-subtle px-3 text-[12px] font-medium text-tc-text transition-colors hover:bg-white/[0.05]"
            >
              Open Case
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        );
      })}
      </div>
    </ProductPanel>
  );
}
