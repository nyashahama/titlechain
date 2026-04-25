mod config;
mod db;
mod http;
mod ingestion;
mod materialize;
mod normalization;
mod projection;
mod read_model;
mod worker;

use sqlx::postgres::PgPoolOptions;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let config = config::Config::from_env();
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await?;

    let metrics_addr = config.metrics_addr.clone();
    let worker_handle = tokio::spawn(worker::run(pool, config));
    let http_handle = tokio::spawn(http::serve_metrics(metrics_addr));

    let (worker_res, http_res) = tokio::join!(worker_handle, http_handle);
    worker_res??;
    http_res??;
    Ok(())
}
