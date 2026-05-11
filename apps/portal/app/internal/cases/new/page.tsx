import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listAnalysts } from "../api";
import { CaseIntakeForm } from "../_components/case-intake-form";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { ProductPanel } from "@/app/_components/product/ProductPanel";

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{
    linked_property_id?: string;
    property_description?: string;
    locality_or_area?: string;
    municipality_or_deeds_office?: string;
    title_reference?: string;
  }>;
}) {
  const params = await searchParams;
  const analysts = await listAnalysts();
  const defaultActorId = analysts[0]?.id ?? "";

  const initialValues = params.linked_property_id
    ? {
        linked_property_id: params.linked_property_id,
        property_description: params.property_description,
        locality_or_area: params.locality_or_area,
        municipality_or_deeds_office: params.municipality_or_deeds_office,
        title_reference: params.title_reference,
      }
    : undefined;

  return (
    <ProductPage className="max-w-3xl">
      <PageHeader
        eyebrow="Operations"
        title="New Case"
        description="Create a new title verification case from a property record or direct intake details."
        action={
          <Link
            href="/internal/cases"
            className="inline-flex items-center gap-2 rounded-md border border-tc-border bg-tc-surface px-3 py-2 text-[13px] font-medium text-tc-text transition-colors hover:bg-white/[0.05]"
          >
            <ArrowLeft className="size-4" />
            Back to cases
          </Link>
        }
      />

      <ProductPanel className="p-6 md:p-8">
        <CaseIntakeForm analysts={analysts} defaultActorId={defaultActorId} initialValues={initialValues} />
      </ProductPanel>
    </ProductPage>
  );
}
