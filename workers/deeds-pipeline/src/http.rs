use axum::{routing::get, Router};

async fn healthz() -> &'static str {
    "ok"
}

async fn metrics() -> &'static str {
    "titlechain_worker_up 1\n"
}

pub fn app() -> Router {
    Router::new()
        .route("/healthz", get(healthz))
        .route("/metrics", get(metrics))
}

pub async fn serve_metrics(addr: String) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app()).await?;
    Ok(())
}
