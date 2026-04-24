export type RunSummary = {
  id: string;
  run_type: string;
  status: string;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  latest_error: string;
  started_at: string;
  finished_at: string;
  created_at: string;
};