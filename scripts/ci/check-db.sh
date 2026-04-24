#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"

goose -dir db/migrations postgres "${DATABASE_URL}" up
set +e
validate_output="$(goose -dir db/migrations postgres "${DATABASE_URL}" validate 2>&1)"
validate_exit=$?
set -e

if [ "${validate_exit}" -eq 0 ]; then
  printf "%s\n" "${validate_output}"
elif printf "%s" "${validate_output}" | grep -q 'no such command\|unknown command'; then
  printf "WARNING: goose validate not available, skipping validation\n"
  printf "%s\n" "${validate_output}"
else
  printf "%s\n" "${validate_output}"
  exit "${validate_exit}"
fi
sqlc generate
git diff --exit-code -- services/api/internal/store/sqlc
