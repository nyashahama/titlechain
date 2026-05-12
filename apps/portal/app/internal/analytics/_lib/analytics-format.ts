import type { ProductTone } from "@/app/_lib/product/status";

import type { AnalyticsRangeKey } from "../types";

export type AnalyticsTone = ProductTone;

const rangeLabels: Record<AnalyticsRangeKey, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "All time",
};

const dangerStatuses = new Set(["failed", "stop", "closed_unresolved", "conflicting"]);
const warningStatuses = new Set([
  "review",
  "in_review",
  "reopened",
  "pending",
  "running",
  "quarantined",
]);
const successStatuses = new Set(["clear", "resolved", "completed", "confirmed"]);

const caseStatusTones: Record<string, AnalyticsTone> = {
  open: "info",
  in_review: "warning",
  resolved: "success",
  closed_unresolved: "danger",
  reopened: "info",
};

const decisionTones: Record<string, AnalyticsTone> = {
  clear: "success",
  review: "warning",
  stop: "danger",
};

const evidenceTones: Record<string, AnalyticsTone> = {
  captured: "info",
  confirmed: "success",
  conflicting: "danger",
  superseded: "muted",
  verified: "success",
  failed: "danger",
};

const runStatusTones: Record<string, AnalyticsTone> = {
  pending: "warning",
  running: "info",
  completed: "success",
  failed: "danger",
  quarantined: "warning",
  none: "muted",
};

function normalizedKey(value: string): string {
  return value.trim().toLowerCase();
}

function toneFromMap(status: string, tones: Record<string, AnalyticsTone>): AnalyticsTone {
  return tones[normalizedKey(status)] ?? "muted";
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return "0m";
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatPercent(value: number, total: number): string {
  if (total <= 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export function rangeLabel(range: AnalyticsRangeKey): string {
  return rangeLabels[range];
}

export function statusTone(status: string | null | undefined): ProductTone {
  const normalized = (status ?? "").trim().toLowerCase();

  if (dangerStatuses.has(normalized)) {
    return "danger";
  }
  if (warningStatuses.has(normalized)) {
    return "warning";
  }
  if (successStatuses.has(normalized)) {
    return "success";
  }
  return "muted";
}

export function caseStatusTone(status: string): AnalyticsTone {
  return toneFromMap(status, caseStatusTones);
}

export function decisionTone(decision: string): AnalyticsTone {
  return toneFromMap(decision, decisionTones);
}

export function evidenceTone(status: string): AnalyticsTone {
  return toneFromMap(status, evidenceTones);
}

export function runStatusTone(status: string): AnalyticsTone {
  return toneFromMap(status, runStatusTones);
}

export function titleize(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
