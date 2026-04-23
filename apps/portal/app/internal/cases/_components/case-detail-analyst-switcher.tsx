"use client";

import { Analyst } from "../types";
import { AnalystSwitcher } from "./analyst-switcher";

export function CaseDetailAnalystSwitcher({
  analysts,
  selected,
  caseId,
}: {
  analysts: Analyst[];
  selected: string;
  caseId: string;
}) {
  return (
    <AnalystSwitcher
      analysts={analysts}
      selected={selected}
      onChange={(id) => {
        const url = new URL(window.location.href);
        if (id) {
          url.searchParams.set("actor", id);
        } else {
          url.searchParams.delete("actor");
        }
        window.location.href = url.toString();
      }}
    />
  );
}
