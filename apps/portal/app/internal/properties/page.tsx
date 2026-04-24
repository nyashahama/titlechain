import { listProperties } from "./api";
import { BentoGrid, BentoGridItem } from "@/app/_components/bento-grid";
import { PropertyCard } from "@/app/_components/property-card";
import { EmptyState } from "@/app/_components/ui/empty-state";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; locality?: string; status?: string }>;
}) {
  const params = await searchParams;
  const properties = await listProperties({
    q: params.q,
    locality: params.locality,
    status: params.status,
  });

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      <div className="mb-10">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Properties</h1>
          <p className="text-[13px] text-muted mt-1">Search and browse seeded property projections</p>
        </div>

        <form className="flex flex-wrap gap-3">
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search description, title ref, or owner..."
            className="flex-1 min-w-[200px] bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
          <input
            name="locality"
            defaultValue={params.locality}
            placeholder="Locality"
            className="w-[180px] bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
          <input
            name="status"
            defaultValue={params.status}
            placeholder="Status"
            className="w-[140px] bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground placeholder:text-muted-more focus:outline-none focus:border-border-light/50 transition-colors"
          />
          <button
            type="submit"
            className="bg-foreground text-background text-[13px] font-medium px-4 py-[7px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            Search
          </button>
        </form>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="No properties found"
          description="Try adjusting your search or trigger a property sync."
        />
      ) : (
        <BentoGrid>
          {properties.map((p) => (
            <BentoGridItem key={p.property_id}>
              <PropertyCard property={p} />
            </BentoGridItem>
          ))}
        </BentoGrid>
      )}
    </div>
  );
}