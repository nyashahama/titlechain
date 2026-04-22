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

