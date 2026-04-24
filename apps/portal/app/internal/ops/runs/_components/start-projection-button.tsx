"use client";

import { useState } from "react";
import { toast } from "sonner";
import { startProjectionAction } from "../actions";

export function StartProjectionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const run = await startProjectionAction();
      toast.success("Property sync started", { description: `Run ${run.id}` });
    } catch (err) {
      toast.error("Sync failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-foreground text-background text-[13px] font-medium px-4 py-[8px] rounded-full transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
    >
      {loading ? "Syncing..." : "Sync Properties"}
    </button>
  );
}