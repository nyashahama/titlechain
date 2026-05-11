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
      className="inline-flex h-9 items-center rounded-md bg-tc-accent px-3 text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Syncing..." : "Sync Properties"}
    </button>
  );
}
