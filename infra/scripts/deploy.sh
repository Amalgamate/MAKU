#!/usr/bin/env bash
# Production deployment. Uses the host's existing Nginx and root-controlled
# Docker daemon; deploy does not need Docker group membership.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

COMPOSE=(sudo docker compose -f docker-compose.prod.yml)
SITE_AVAILABLE=/etc/nginx/sites-available/maku.trendscore.co.ke
SITE_ENABLED=/etc/nginx/sites-enabled/maku.trendscore.co.ke
SCHEMA_MARKER=/var/lib/maku/schema-initialized

echo '==> Preparing protected production secrets'
bash infra/scripts/configure-production-env.sh
"${COMPOSE[@]}" config --quiet

available_mb=$(df -Pm / | awk 'NR==2 {print $4}')
if (( available_mb < 1800 )); then
  echo "ERROR: only ${available_mb} MB free; refusing a production build below 1800 MB." >&2
  exit 1
fi

echo '==> Building frontend bundles'
"${COMPOSE[@]}" --profile build run --rm web-build

echo '==> Starting database and storage services'
"${COMPOSE[@]}" up -d postgres redis minio
for attempt in $(seq 1 40); do
  if "${COMPOSE[@]}" exec -T postgres pg_isready -U maku_user -d maku_db >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 40 ]]; then
    "${COMPOSE[@]}" logs --tail=100 postgres
    echo 'ERROR: PostgreSQL did not become ready.' >&2
    exit 1
  fi
  sleep 3
done

echo '==> Building API image'
"${COMPOSE[@]}" build api
if ! sudo test -f "$SCHEMA_MARKER"; then
  echo '==> Creating initial MAKU database schema'
  "${COMPOSE[@]}" run --rm --no-deps api node dist/database/initialize-schema.js
  sudo install -d -m 755 "$(dirname "$SCHEMA_MARKER")"
  sudo touch "$SCHEMA_MARKER"
fi

echo '==> Starting API'
"${COMPOSE[@]}" up -d api
for attempt in $(seq 1 40); do
  if curl --fail --silent http://127.0.0.1:3210/v1/health >/dev/null; then
    break
  fi
  if [[ "$attempt" -eq 40 ]]; then
    "${COMPOSE[@]}" logs --tail=100 api
    echo 'ERROR: API did not become healthy.' >&2
    exit 1
  fi
  sleep 3
done

echo '==> Installing MAKU route in existing Nginx'
if [[ ! -d /etc/letsencrypt/live/maku.trendscore.co.ke ]]; then
  sudo install -m 644 infra/nginx/host-maku-bootstrap.conf "$SITE_AVAILABLE"
  sudo ln -sfn "$SITE_AVAILABLE" "$SITE_ENABLED"
  sudo nginx -t
  sudo systemctl reload nginx
  echo '==> Issuing TLS certificate for MAKU public and app hostnames'
  sudo certbot certonly --webroot -w /var/www/html \
    -d maku.trendscore.co.ke -d app.maku.trendscore.co.ke \
    --non-interactive --agree-tos --register-unsafely-without-email
fi

sudo install -m 644 infra/nginx/host-maku.conf "$SITE_AVAILABLE"
sudo ln -sfn "$SITE_AVAILABLE" "$SITE_ENABLED"
sudo nginx -t
sudo systemctl reload nginx

echo '==> Checking production endpoints'
curl --fail --silent --show-error https://maku.trendscore.co.ke/ >/dev/null
curl --fail --silent --show-error https://app.maku.trendscore.co.ke/ >/dev/null
curl --fail --silent --show-error https://maku.trendscore.co.ke/v1/health >/dev/null
echo 'MAKU deployment completed successfully.'
