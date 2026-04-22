use axum::{routing::get, Router};

async fn healthz() -> &'static str {
    "ok"
}

async fn metrics() -> &'static str {
    "titlechain_worker_up 1\n"
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/healthz", get(healthz))
        .route("/metrics", get(metrics));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:9091")
        .await
        .expect("bind worker listener");

    axum::serve(listener, app).await.expect("serve worker");
}
