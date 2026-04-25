export type CaseStatus = "open" | "in_review" | "resolved" | "closed_unresolved" | "reopened";
export type DecisionOutcome = "clear" | "review" | "stop";
export type ReasonCategory = "clear_support" | "hard_block" | "review_trigger" | "unresolved_information";
export type EvidenceStatus = "captured" | "confirmed" | "conflicting" | "superseded";

export type Analyst = {
  id: string;
  display_name: string;
  email: string;
  active: boolean;
};

export type ReasonCode = {
  code: string;
  label: string;
  category: ReasonCategory;
  is_hard_block: boolean;
  sort_order: number;
};

export type CaseSummary = {
  id: string;
  case_reference: string;
  property_description: string;
  locality_or_area: string;
  municipality_or_deeds_office: string;
  title_reference?: string;
  matter_reference?: string;
  status: CaseStatus;
  assignee_id: string;
  created_by: string;
  linked_seed_property_id?: string;
  created_at: string;
  updated_at: string;
};

export type PropertyMatch = {
  id: string;
  case_id: string;
  seed_property_id: string;
  match_source: string;
  confidence: number;
  status: string;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at: string;
};

export type EvidenceItem = {
  id: string;
  case_id: string;
  evidence_type: string;
  source_type: string;
  source_reference: string;
  external_reference?: string;
  excerpt?: string;
  extracted_facts: Record<string, unknown>;
  evidence_status: EvidenceStatus;
  analyst_note?: string;
  created_by: string;
  created_at: string;
};

export type Party = {
  id: string;
  case_id: string;
  role: string;
  entity_type: string;
  display_name: string;
  identifier?: string;
  note?: string;
  created_by: string;
  created_at: string;
};

export type Decision = {
  id: string;
  case_id: string;
  decision: DecisionOutcome;
  reason_codes: ReasonCode[];
  note: string;
  status: string;
  created_by: string;
  created_at: string;
  decision_source: "manual" | "accepted_proposal" | "manual_override";
  proposal_id?: string;
};

export type DecisionProposal = {
  id: string;
  engine_version: string;
  decision: DecisionOutcome;
  summary: string;
  reason_codes: ReasonCode[];
  explanation: Record<string, unknown>;
  status: string;
  created_at: string;
};

export type AuditEvent = {
  id: string;
  case_id: string;
  actor_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CaseDetail = {
  case: CaseSummary;
  matches: PropertyMatch[];
  evidence: EvidenceItem[];
  parties: Party[];
  decisions: Decision[];
  current_proposal?: DecisionProposal;
  audit_events: AuditEvent[];
};

export type CreateCaseInput = {
  actor_id: string;
  property_description: string;
  locality_or_area: string;
  municipality_or_deeds_office: string;
  title_reference?: string;
  matter_reference?: string;
  intake_note?: string;
  seed_property_id?: string;
  linked_property_id?: string;
};

export type AddEvidenceInput = {
  actor_id: string;
  evidence_type: string;
  source_type: string;
  source_reference: string;
  external_reference?: string;
  excerpt?: string;
  extracted_facts?: Record<string, unknown>;
  evidence_status: EvidenceStatus;
  analyst_note?: string;
};

export type RecordDecisionInput = {
  actor_id: string;
  decision: DecisionOutcome;
  reason_codes: string[];
  note: string;
};

export type CloseUnresolvedInput = {
  actor_id: string;
  reason_codes: string[];
  note: string;
};

export type ReassignCaseInput = {
  actor_id: string;
  assignee_id: string;
  note?: string;
};

export type ConfirmPropertyMatchInput = {
  actor_id: string;
  match_id: string;
  action: "confirm" | "reject";
};

export type AddPartyInput = {
  actor_id: string;
  role: string;
  entity_type: string;
  display_name: string;
  identifier?: string;
  note?: string;
};

export type ReopenCaseInput = {
  actor_id: string;
  note?: string;
};
