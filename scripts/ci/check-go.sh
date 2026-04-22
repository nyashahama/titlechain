#!/usr/bin/env bash
set -euo pipefail

cd services/api
go test ./...
go build ./cmd/api
