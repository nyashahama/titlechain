"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PropertySummary } from "@/app/internal/properties/types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface PropertyCardProps {
  property: PropertySummary;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden group" hover>
      <div className="p-5">
        {/* Risk / Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge status={property.status.toLowerCase().includes("blocker") ? "open" : "resolved"} />
          <span className="text-[11px] font-mono text-muted-more">
            {property.title_reference || "No title ref"}
          </span>
        </div>

        {/* Property Description */}
        <h3 className="text-[14px] font-medium text-foreground leading-snug mb-1 line-clamp-2">
          {property.property_description}
        </h3>
        <p className="text-[12px] text-muted mb-4">
          {property.locality_or_area} · {property.municipality_or_deeds_office}
        </p>

        {/* Owner */}
        {property.current_owner_name && (
          <p className="text-[11px] text-muted-more mb-4 truncate">
            Owner: {property.current_owner_name}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            href={{
              pathname: "/internal/cases/new",
              query: {
                seed_property_id: property.property_id,
                property_description: property.property_description,
                locality_or_area: property.locality_or_area,
                municipality_or_deeds_office: property.municipality_or_deeds_office,
                title_reference: property.title_reference ?? "",
              },
            }}
            className="flex-1 bg-foreground text-background text-[12px] font-medium px-3 py-[6px] rounded-full text-center transition-opacity duration-200 hover:opacity-80"
          >
            Open Case
          </Link>
        </div>
      </div>
    </Card>
  );
}
