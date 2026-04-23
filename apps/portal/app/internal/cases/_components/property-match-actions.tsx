"use client";

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
    await confirmPropertyMatchAction(caseId, formData);
    window.location.reload();
  }

  return (
    <div className="mt-1 flex gap-2">
      <button
        onClick={() => handleAction("confirm")}
        className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
      >
        Confirm
      </button>
      <button
        onClick={() => handleAction("reject")}
        className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
      >
        Reject
      </button>
    </div>
  );
}
