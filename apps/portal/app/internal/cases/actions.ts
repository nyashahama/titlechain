"use server";

import { revalidatePath } from "next/cache";
import {
  createCase,
  addEvidence,
  recordDecision,
  closeUnresolved,
  reassignCase,
  confirmPropertyMatch,
  addParty,
  reopenCase,
  reevaluateCase,
  acceptProposal,
} from "./api";

export async function createCaseAction(formData: FormData) {
  const input: Record<string, unknown> = {
    actor_id: formData.get("actor_id") as string,
    property_description: formData.get("property_description") as string,
    locality_or_area: formData.get("locality_or_area") as string,
    municipality_or_deeds_office: formData.get("municipality_or_deeds_office") as string,
    title_reference: (formData.get("title_reference") as string) || undefined,
    matter_reference: (formData.get("matter_reference") as string) || undefined,
    intake_note: (formData.get("intake_note") as string) || undefined,
  };
  const linkedPropertyId = (formData.get("linked_property_id") as string) || undefined;
  if (linkedPropertyId) {
    input.linked_property_id = linkedPropertyId;
  }
  const detail = await createCase(input as any);
  revalidatePath("/internal/cases");
  return detail;
}

export async function addEvidenceAction(caseId: string, formData: FormData) {
  let extractedFacts: Record<string, unknown> = {};
  const factsRaw = formData.get("extracted_facts") as string;
  if (factsRaw) {
    try {
      extractedFacts = JSON.parse(factsRaw);
    } catch {
      extractedFacts = {};
    }
  }

  const detail = await addEvidence(caseId, {
    actor_id: formData.get("actor_id") as string,
    evidence_type: formData.get("evidence_type") as string,
    source_type: formData.get("source_type") as string,
    source_reference: formData.get("source_reference") as string,
    external_reference: (formData.get("external_reference") as string) || undefined,
    excerpt: (formData.get("excerpt") as string) || undefined,
    extracted_facts: extractedFacts,
    evidence_status: (formData.get("evidence_status") as string) as "captured" | "confirmed" | "conflicting" | "superseded",
    analyst_note: (formData.get("analyst_note") as string) || undefined,
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function recordDecisionAction(caseId: string, formData: FormData) {
  const reasonCodes = formData.getAll("reason_codes").map((v) => String(v));

  const detail = await recordDecision(caseId, {
    actor_id: formData.get("actor_id") as string,
    decision: (formData.get("decision") as string) as "clear" | "review" | "stop",
    reason_codes: reasonCodes,
    note: formData.get("note") as string,
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function closeUnresolvedAction(caseId: string, formData: FormData) {
  const reasonCodes = formData.getAll("reason_codes").map((v) => String(v));

  const detail = await closeUnresolved(caseId, {
    actor_id: formData.get("actor_id") as string,
    reason_codes: reasonCodes,
    note: formData.get("note") as string,
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function reassignCaseAction(caseId: string, formData: FormData) {
  const detail = await reassignCase(caseId, {
    actor_id: formData.get("actor_id") as string,
    assignee_id: formData.get("assignee_id") as string,
    note: (formData.get("note") as string) || undefined,
  });
  revalidatePath("/internal/cases");
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function confirmPropertyMatchAction(caseId: string, formData: FormData) {
  const detail = await confirmPropertyMatch(caseId, {
    actor_id: formData.get("actor_id") as string,
    match_id: formData.get("match_id") as string,
    action: (formData.get("action") as string) as "confirm" | "reject",
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function addPartyAction(caseId: string, formData: FormData) {
  const detail = await addParty(caseId, {
    actor_id: formData.get("actor_id") as string,
    role: formData.get("role") as string,
    entity_type: formData.get("entity_type") as string,
    display_name: formData.get("display_name") as string,
    identifier: (formData.get("identifier") as string) || undefined,
    note: (formData.get("note") as string) || undefined,
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function reopenCaseAction(caseId: string, formData: FormData) {
  const detail = await reopenCase(caseId, {
    actor_id: formData.get("actor_id") as string,
    note: (formData.get("note") as string) || undefined,
  });
  revalidatePath("/internal/cases");
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function reevaluateCaseAction(caseId: string, formData: FormData) {
  const detail = await reevaluateCase(caseId, {
    actor_id: formData.get("actor_id") as string,
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}

export async function acceptProposalAction(caseId: string, formData: FormData) {
  const detail = await acceptProposal(caseId, {
    actor_id: formData.get("actor_id") as string,
    note: (formData.get("note") as string) || undefined,
  });
  revalidatePath(`/internal/cases/${caseId}`);
  return detail;
}
