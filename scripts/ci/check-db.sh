#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"

goose -dir db/migrations postgres "${DATABASE_URL}" up
goose -dir db/migrations postgres "${DATABASE_URL}" validate
sqlc generate
git diff --exit-code -- services/api/internal/store/sqlc
