"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { createMatter } from "../api";
import type { CreateMatterRequest } from "../types";
import { NewMatterForm } from "./_components/NewMatterForm";

export default function NewMatterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(request: CreateMatterRequest) {
    setError("");
    setLoading(true);
    try {
      const matter = await createMatter(request);
      router.push(`/matters/${matter.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create matter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProductPage>
      <PageHeader
        eyebrow="Matters"
        title="New Clear-to-Lodge Check"
        description="Enter property details to run a verification and generate a customer-visible matter record."
        action={
          <Link
            href="/matters"
            className="inline-flex items-center gap-2 rounded-md border border-tc-border bg-tc-surface px-3 py-2 text-[13px] font-medium text-tc-text transition-colors hover:bg-white/[0.05]"
          >
            <ArrowLeft className="size-4" />
            Back to matters
          </Link>
        }
      />
      <NewMatterForm onSubmit={handleSubmit} loading={loading} error={error} />
    </ProductPage>
  );
}
