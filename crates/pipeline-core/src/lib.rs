use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum JobStatus {
    Pending,
    Leased,
    Running,
    Failed,
    Completed,
    Quarantined,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct WorkUnit {
    pub id: String,
    pub kind: String,
    pub status: JobStatus,
}
