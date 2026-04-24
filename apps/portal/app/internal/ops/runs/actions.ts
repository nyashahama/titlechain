"use server";

import { revalidatePath } from "next/cache";
import { startSeedProjectionRun } from "./api";

export async function startProjectionAction() {
  await startSeedProjectionRun();
  revalidatePath("/internal/ops/runs");
}