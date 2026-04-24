use sqlx::PgPool;

pub async fn run(
    _pool: &PgPool,
    _run_id: uuid::Uuid,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // TODO: read source records and land them into raw tables
    Ok(())
}
