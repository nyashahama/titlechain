"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { StateView } from "@/app/_components/product/StateView";
import { listMatters } from "./api";
import { MatterQueue } from "./_components/MatterQueue";
import type { MatterSummary } from "./types";

export default function MattersPage() {
  const [matters, setMatters] = useState<MatterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMatters()
      .then(setMatters)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProductPage>
      <PageHeader
        eyebrow="Matter queue"
        title="Matters"
        description="Track Clear-to-Lodge checks by status, decision, property, and reference."
        action={
          <Link
            href="/matters/new"
            className="inline-flex h-9 items-center rounded-md bg-tc-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-tc-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-accent"
          >
            New Check
          </Link>
        }
      />

      {loading ? (
        <StateView kind="loading" title="Loading matters" description="Fetching the latest matter queue." />
      ) : error ? (
        <StateView kind="error" title="Unable to load matters" description={error} />
      ) : matters.length === 0 ? (
        <StateView
          kind="empty"
          title="No matters yet"
          description="Create your first Clear-to-Lodge check to get started."
          action={
            <Link
              href="/matters/new"
              className="inline-flex h-9 items-center rounded-md border border-tc-border bg-tc-surface-subtle px-4 text-[13px] font-medium text-tc-text transition-colors hover:border-tc-border-strong"
            >
              New Check
            </Link>
          }
        />
      ) : (
        <MatterQueue matters={matters} />
      )}
    </ProductPage>
  );
}
