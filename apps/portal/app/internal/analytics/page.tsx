import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";

import { getAnalyticsOverview } from "./api";
import { AnalyticsDashboard } from "./_components/analytics-dashboard";
import type { AnalyticsRangeKey } from "./types";

const validRanges: AnalyticsRangeKey[] = ["7d", "30d", "90d", "all"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const params = await searchParams;
  const selectedRange = parseRange(params.range);
  const overview = await getAnalyticsOverview(selectedRange);

  return (
    <ProductPage>
      <PageHeader
        eyebrow="Operations"
        title="TitleChain Intelligence"
        description="Monitor matters, decision outcomes, evidence coverage, and source-data health across the internal review operation."
      />

      <AnalyticsDashboard overview={overview} selectedRange={selectedRange} />
    </ProductPage>
  );
}

function parseRange(range: string | string[] | undefined): AnalyticsRangeKey {
  const candidate = Array.isArray(range) ? range[0] : range;

  if (validRanges.includes(candidate as AnalyticsRangeKey)) {
    return candidate as AnalyticsRangeKey;
  }

  return "30d";
}
