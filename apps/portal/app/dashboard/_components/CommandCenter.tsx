import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import type { MatterSummary } from "@/app/matters/types";
import { DecisionExceptions } from "./DecisionExceptions";
import { MatterReadiness } from "./MatterReadiness";
import { QueueHealth } from "./QueueHealth";

export function CommandCenter({ matters }: { matters: MatterSummary[] }) {
  return (
    <ProductPage>
      <PageHeader
        eyebrow="Dashboard"
        title="Command Center"
        description="Operational view of matter throughput, exceptions, and readiness for Clear-to-Lodge decisions."
        action={
          <Link
            href="/matters/new"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-tc-text px-3 text-[13px] font-medium text-tc-background hover:opacity-85"
          >
            <Plus className="size-4" aria-hidden="true" />
            New check
          </Link>
        }
      />
      <QueueHealth matters={matters} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        <DecisionExceptions matters={matters} />
        <MatterReadiness matters={matters} />
      </div>
    </ProductPage>
  );
}
