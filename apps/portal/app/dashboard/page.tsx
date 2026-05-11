"use client";

import { useEffect, useState } from "react";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { StateView } from "@/app/_components/product/StateView";
import { listMatters } from "../matters/api";
import type { MatterSummary } from "../matters/types";
import { CommandCenter } from "./_components/CommandCenter";

export default function DashboardPage() {
  const [matters, setMatters] = useState<MatterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMatters()
      .then(setMatters)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ProductPage>
        <StateView kind="loading" title="Loading command center" description="Fetching current matter queue." />
      </ProductPage>
    );
  }

  if (error) {
    return (
      <ProductPage>
        <StateView kind="error" title="Unable to load command center" description={error} />
      </ProductPage>
    );
  }

  return <CommandCenter matters={matters} />;
}
