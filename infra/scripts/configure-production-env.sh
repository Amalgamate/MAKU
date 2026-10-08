#!/usr/bin/env bash
# Create strong first-run secrets on the production host. Existing env files are
# preserved so deployments never silently rotate credentials.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
umask 077

if [[ ! -f .env ]]; then
  cat > .env <<EOF
DB_NAME=maku_db
DB_USER=maku_user
DB_PASS=$(openssl rand -hex 32)
EOF
fi

set -a
# This file is generated above and contains only simple KEY=value entries.
. ./.env
set +a

for name in DB_NAME DB_USER DB_PASS; do
  [[ -n "${!name:-}" ]] || { echo "Missing required setting: ${name}" >&2; exit 1; }
done
[[ "$DB_PASS" != changeme* ]] || {
  echo 'Replace placeholder production credentials before deployment.' >&2
  exit 1
}

mkdir -p apps/api
if [[ ! -f apps/api/.env.production ]]; then
  cat > apps/api/.env.production <<EOF
NODE_ENV=production
PORT=3000
FRONTEND_PUBLIC_URL=https://maku.trendscore.co.ke
FRONTEND_APP_URL=https://app.maku.trendscore.co.ke
API_BASE_URL=https://maku.trendscore.co.ke
DB_HOST=postgres
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_LOGGING=false
JWT_ACCESS_SECRET=$(openssl rand -hex 48)
JWT_REFRESH_SECRET=$(openssl rand -hex 48)
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
EOF
fi
chmod 600 .env apps/api/.env.production
