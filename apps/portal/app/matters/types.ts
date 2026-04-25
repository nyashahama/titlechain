export type CustomerStatus = "submitted" | "in_review" | "resolved" | "reopened";

export type MatterSummary = {
  id: string;
  case_id: string;
  case_reference: string;
  customer_reference: string;
  customer_status: CustomerStatus;
  property_description: string;
  locality_or_area: string;
  municipality_or_deeds_office: string;
  title_reference: string;
  decision: string;
  submitted_at: string;
  updated_at: string;
};

export type VisibleEvidence = {
  type: string;
  source_type: string;
  source_reference: string;
  excerpt: string;
  status: string;
};

export type VisibleReason = {
  code: string;
  label: string;
};

export type VisibleTimelineEvent = {
  type: string;
  label: string;
  created_at: string;
};

export type MatterDetail = {
  summary: MatterSummary;
  evidence: VisibleEvidence[];
  reasons: VisibleReason[];
  timeline: VisibleTimelineEvent[];
};

export type CreateMatterRequest = {
  property_description: string;
  locality_or_area: string;
  municipality_or_deeds_office: string;
  title_reference?: string;
  customer_reference?: string;
  intake_note?: string;
};

export type ReopenMatterRequest = {
  note: string;
};

export type SummaryExport = {
  matter: MatterDetail;
  generated_at: string;
  disclaimer: string;
};
