"use server";

import { revalidatePath } from "next/cache";
import { createMatter, reopenMatter, createSummary } from "./api";

export async function createMatterAction(formData: FormData) {
  const matter = await createMatter({
    property_description: String(formData.get("property_description") ?? ""),
    locality_or_area: String(formData.get("locality_or_area") ?? ""),
    municipality_or_deeds_office: String(formData.get("municipality_or_deeds_office") ?? ""),
    title_reference: String(formData.get("title_reference") ?? ""),
    customer_reference: String(formData.get("customer_reference") ?? ""),
    intake_note: String(formData.get("intake_note") ?? ""),
  });
  revalidatePath("/matters");
  return matter;
}

export async function reopenMatterAction(matterId: string, formData: FormData) {
  const detail = await reopenMatter(matterId, { note: String(formData.get("note") ?? "") });
  revalidatePath(`/matters/${matterId}`);
  return detail;
}

export async function createSummaryAction(matterId: string) {
  return createSummary(matterId);
}
