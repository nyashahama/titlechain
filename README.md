# TitleChain

TitleChain is a property transaction intelligence platform for South Africa.

## Workspaces

- `apps/portal`: internal Next.js portal
- `services/api`: Go API and control plane
- `workers/deeds-pipeline`: Rust data-processing worker
- `db`: migrations and SQL query definitions
- `infra`: local Docker Compose, Prometheus, and deployment assets

## Quick Start

```bash
npm install
npm run dev --workspace @titlechain/portal
```

## Foundation Verification

Run these commands before merging:

```bash
npm run test --workspace @titlechain/portal
cd services/api && go test ./...
cargo test --workspace
docker compose -f infra/docker/docker-compose.yml config
```

## Phase 1 Case Workflow Verification

Run the internal decision-case workflow checks with:

```bash
sqlc generate
cd services/api && go test ./...
npm run test --workspace @titlechain/portal
```

The phase-one API expects `DATABASE_URL` for runtime database access. Unit tests use in-memory repositories for workflow validation.

## Phase 2 Property Projection Verification

Run these commands after applying migrations:

```bash
sqlc generate
cd services/api && go test ./...
npm run test --workspace @titlechain/portal
cargo test --workspace
```

