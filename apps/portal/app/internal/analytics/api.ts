import { requirePilotAdmin } from "@/app/_lib/product/server-auth";

import type { AnalyticsOverview, AnalyticsRangeKey } from "./types";

const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";

export async function getAnalyticsOverview(
  range: AnalyticsRangeKey = "30d"
): Promise<AnalyticsOverview> {
  await requirePilotAdmin();

  const res = await fetch(
    `${apiBaseUrl}/api/internal/analytics/overview?range=${encodeURIComponent(range)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<AnalyticsOverview>;
}
