use pipeline_core::WorkUnit;

pub trait JobStore {
    fn claim_next_job(&self, worker_id: &str) -> Option<WorkUnit>;
}
