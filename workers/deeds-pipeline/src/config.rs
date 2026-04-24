use std::time::Duration;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub poll_interval: Duration,
    pub metrics_addr: String,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            database_url: std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            poll_interval: Duration::from_secs(
                std::env::var("POLL_INTERVAL_SECS")
                    .ok()
                    .and_then(|v| v.parse().ok())
                    .unwrap_or(5),
            ),
            metrics_addr: std::env::var("METRICS_ADDR").unwrap_or_else(|_| "0.0.0.0:9091".into()),
        }
    }
}
