import { listProperties } from "./api";
import { PropertyResults } from "./_components/property-results";
import { PropertySearchToolbar } from "./_components/property-search-toolbar";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPanel } from "@/app/_components/product/ProductPanel";

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
    <ProductPage>
      <PageHeader
        eyebrow="Operations"
        title="Properties"
        description="Search seeded property projections and open analyst cases from matched records."
      />

      <ProductPanel>
        <PropertySearchToolbar
          initialQuery={params.q}
          initialLocality={params.locality}
          initialStatus={params.status}
        />
      </ProductPanel>

      <PropertyResults properties={properties} />
    </ProductPage>
  );
}
