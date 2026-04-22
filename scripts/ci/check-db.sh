#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"

goose -dir db/migrations postgres "${DATABASE_URL}" up
if goose -h 2>&1 | grep -q "validate"; then
  goose -dir db/migrations postgres "${DATABASE_URL}" validate
else
  goose -dir db/migrations postgres "${DATABASE_URL}" status
fi
sqlc generate
git diff --exit-code -- services/api/internal/store/sqlc
