"use server";

import { revalidatePath } from "next/cache";
import { toast } from "sonner";
import { startSeedProjectionRun } from "./api";

export async function startProjectionAction() {
  try {
    const run = await startSeedProjectionRun();
    toast.success("Property sync started", { description: `Run ${run.id}` });
    revalidatePath("/internal/ops/runs");
    return run;
  } catch (err) {
    toast.error("Sync failed", { description: err instanceof Error ? err.message : "Unknown error" });
    throw err;
  }
}
