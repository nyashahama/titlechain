"use client";

import { useState } from "react";
import { startProjectionAction } from "../actions";

export function StartProjectionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await startProjectionAction();
    } catch {
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