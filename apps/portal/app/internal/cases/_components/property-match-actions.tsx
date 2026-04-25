"use client";

import { toast } from "sonner";
import { confirmPropertyMatchAction } from "../actions";

export function PropertyMatchActions({
  caseId,
  matchId,
  actorId,
  status,
}: {
  caseId: string;
  matchId: string;
  actorId: string;
  status: string;
}) {
  if (status !== "candidate") return null;

  async function handleAction(action: "confirm" | "reject") {
    const formData = new FormData();
    formData.set("actor_id", actorId);
    formData.set("match_id", matchId);
    formData.set("action", action);
    try {
      await confirmPropertyMatchAction(caseId, formData);
      toast.success("Property match updated");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to update property match", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("confirm")}
        className="px-3 py-[5px] rounded-full text-[11px] font-medium bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] transition-colors hover:bg-[rgba(74,222,128,0.25)]"
      >
        Confirm
      </button>
      <button
        onClick={() => handleAction("reject")}
        className="px-3 py-[5px] rounded-full text-[11px] font-medium bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] transition-colors hover:bg-[rgba(239,68,68,0.25)]"
      >
        Reject
      </button>
    </div>
  );
}
