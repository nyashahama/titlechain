#!/usr/bin/env bash
set -euo pipefail

npm run lint --workspace @titlechain/portal
npm run test --workspace @titlechain/portal
npm run build --workspace @titlechain/portal
