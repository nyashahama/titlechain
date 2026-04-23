"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Analyst } from "../types";
import { AnalystSwitcher } from "./analyst-switcher";

export function ClientAnalystSwitcher({
  analysts,
  defaultSelected,
}: {
  analysts: Analyst[];
  defaultSelected: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <AnalystSwitcher
      analysts={analysts}
      selected={defaultSelected}
      onChange={(id) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
          params.set("assignee_id", id);
        } else {
          params.delete("assignee_id");
        }
        router.push(`/internal/cases?${params.toString()}`);
      }}
    />
  );
}
