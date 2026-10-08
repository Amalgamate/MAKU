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

echo '==> Publishing static files for host Nginx'
sudo install -d -m 755 /var/www/maku/public /var/www/maku/app
sudo rsync -a --delete --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  apps/web-public/dist/ /var/www/maku/public/
sudo rsync -a --delete --chown=root:root --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
  apps/web-app/dist/ /var/www/maku/app/

available_mb=$(df -Pm / | awk 'NR==2 {print $4}')
if (( available_mb < 200 )); then
  echo "ERROR: only ${available_mb} MB free; refusing deployment below 200 MB." >&2
  exit 1
fi

echo '==> Starting database service'
"${COMPOSE[@]}" up -d postgres
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

if [[ -s .admin-bootstrap ]]; then
  echo '==> Creating the one-time MAKU administrator if missing'
  tr -d '\r\n' < .admin-bootstrap | "${COMPOSE[@]}" exec -T api sh -c \
    'IFS= read -r MAKU_ADMIN_BOOTSTRAP_PASSWORD; export MAKU_ADMIN_BOOTSTRAP_PASSWORD; node dist/database/bootstrap-admin.js'
  sudo rm -f .admin-bootstrap
fi

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
for hostname in maku.trendscore.co.ke app.maku.trendscore.co.ke; do
  echo "DNS addresses for ${hostname}:"
  getent ahosts "$hostname" | awk '!seen[$1]++ {print $1}' || true
  if ! sudo openssl x509 -in /etc/letsencrypt/live/maku.trendscore.co.ke/fullchain.pem \
    -noout -checkhost "$hostname" >/dev/null; then
    echo "ERROR: production certificate does not cover ${hostname}." >&2
    exit 1
  fi
  curl --fail --silent --show-error --resolve "${hostname}:443:127.0.0.1" \
    "https://${hostname}/" >/dev/null
done
curl --fail --silent --show-error --resolve maku.trendscore.co.ke:443:127.0.0.1 \
  https://maku.trendscore.co.ke/v1/health >/dev/null
echo 'MAKU deployment completed successfully.'
