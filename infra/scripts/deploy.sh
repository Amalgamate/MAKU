#!/usr/bin/env bash
# MAKU production deploy. Run from the repository root on the VPS.
set -euo pipefail

COMPOSE=(docker compose -f docker-compose.prod.yml)
BUILD_FLAG=${1:-}

echo "==> [MAKU Deploy] Starting at $(date -Is)"
echo "==> [MAKU Deploy] Building web bundles in Docker..."
"${COMPOSE[@]}" --profile build run --rm web-build

if [[ "$BUILD_FLAG" == "--build" ]]; then
  echo "==> [MAKU Deploy] Building API image without cache..."
  "${COMPOSE[@]}" build --no-cache api
else
  echo "==> [MAKU Deploy] Building API image..."
  "${COMPOSE[@]}" build api
fi

echo "==> [MAKU Deploy] Starting production services..."
"${COMPOSE[@]}" up -d --remove-orphans

echo "==> [MAKU Deploy] Waiting for API health..."
for attempt in $(seq 1 30); do
  if curl --fail --silent http://127.0.0.1:3000/health >/dev/null; then
    break
  fi
  if [[ "$attempt" -eq 30 ]]; then
    "${COMPOSE[@]}" logs --tail=100 api
    echo "ERROR: API health check timed out" >&2
    exit 1
  fi
  sleep 5
done

echo "==> [MAKU Deploy] Checking Nginx configuration and reloading..."
"${COMPOSE[@]}" exec nginx nginx -t
"${COMPOSE[@]}" exec nginx nginx -s reload

echo "==> [MAKU Deploy] Done at $(date -Is)"
echo "  Public site : https://maku.trendscore.co.ke"
echo "  App         : https://app.maku.trendscore.co.ke"
echo "  API         : https://api.maku.trendscore.co.ke/api/docs"
