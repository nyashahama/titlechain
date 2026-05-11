"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { StateView } from "@/app/_components/product/StateView";
import { getMatterDetail, reopenMatter } from "../api";
import type { MatterDetail } from "../types";
import { MatterRecord } from "./_components/MatterRecord";

export default function MatterDetailPage() {
  const params = useParams();
  const matterId = params.id as string;
  const [detail, setDetail] = useState<MatterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reopening, setReopening] = useState(false);
  const [reopenError, setReopenError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getMatterDetail(matterId)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load matter"))
      .finally(() => setLoading(false));
  }, [matterId]);

  async function handleReopen(note: string) {
    setReopening(true);
    setReopenError("");
    try {
      const updated = await reopenMatter(matterId, { note });
      setDetail(updated);
    } catch (err) {
      setReopenError(err instanceof Error ? err.message : "Failed to reopen matter");
      throw err;
    } finally {
      setReopening(false);
    }
  }

  if (loading) {
    return (
      <ProductPage>
        <StateView kind="loading" title="Loading matter" description="Fetching the latest matter record." />
      </ProductPage>
    );
  }

  if (error || !detail) {
    return (
      <ProductPage>
        <StateView kind="error" title="Unable to load matter" description={error || "Matter not found."} />
      </ProductPage>
    );
  }

  return (
    <ProductPage>
      <MatterRecord detail={detail} onReopen={handleReopen} reopening={reopening} reopenError={reopenError} />
    </ProductPage>
  );
}
