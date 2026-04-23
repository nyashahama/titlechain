"use client";

import { Analyst } from "../types";
import { AnalystSwitcher } from "./analyst-switcher";

export function ClientAnalystSwitcher({
  analysts,
  defaultSelected,
}: {
  analysts: Analyst[];
  defaultSelected: string;
}) {
  return (
    <AnalystSwitcher
      analysts={analysts}
      selected={defaultSelected}
      onChange={(id) => {
        // Could set a cookie or localStorage here for persistence
        console.log("Switched analyst:", id);
      }}
    />
  );
}
