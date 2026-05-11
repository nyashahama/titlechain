export type AnalyticsRangeKey = "7d" | "30d" | "90d" | "all";

export type AnalyticsRange = {
  key: AnalyticsRangeKey;
  from?: string;
  to: string;
};

export type AnalyticsOperatingSummary = {
  submitted_count: number;
  resolved_count: number;
  in_review_count: number;
  reopened_count: number;
  unresolved_count: number;
  average_seconds_to_resolve: number;
  oldest_in_review_seconds: number;
  accepted_proposal_count: number;
  manual_override_count: number;
};

export type AnalyticsDecisionMetric = {
  decision: string;
  count: number;
  manual_count: number;
  manual_override_count: number;
  accepted_proposal_count: number;
};

export type AnalyticsReasonCodeMetric = {
  code: string;
  label: string;
  category: string;
  count: number;
};

export type AnalyticsEvidenceStatusMetric = {
  status: string;
  count: number;
};

export type AnalyticsEvidenceSourceMetric = {
  source_type: string;
  count: number;
};

export type AnalyticsEvidence = {
  total_items: number;
  cases_without_evidence: number;
  cases_without_confirmed_evidence: number;
  status_mix: AnalyticsEvidenceStatusMetric[];
  source_type_mix: AnalyticsEvidenceSourceMetric[];
};

export type AnalyticsSourceHealth = {
  latest_run_id?: string;
  latest_run_status: string;
  latest_error: string;
  failed_job_count: number;
  pending_job_count: number;
  quarantined_record_count: number;
  source_link_count: number;
  last_successful_run_at?: string;
};

export type AnalyticsRiskQueueItem = {
  case_id: string;
  case_reference: string;
  status: string;
  customer_status: string;
  organization_name: string;
  age_seconds: number;
  risk_reasons: string[];
};

export type AnalyticsOverview = {
  range: AnalyticsRange;
  operating_summary: AnalyticsOperatingSummary;
  decision_mix: AnalyticsDecisionMetric[];
  reason_codes: AnalyticsReasonCodeMetric[];
  evidence: AnalyticsEvidence;
  source_health: AnalyticsSourceHealth;
  risk_queue: AnalyticsRiskQueueItem[];
};
