#!/bin/bash
# ============================================================================
# MAKU Platform — Initial Let's Encrypt SSL Certificate Setup
# Run ONCE on first VPS deployment after DNS records point to the VPS IP.
#
# Usage:
#   chmod +x infra/scripts/init-letsencrypt.sh
#   ./infra/scripts/init-letsencrypt.sh
# ============================================================================

set -euo pipefail

DOMAINS=(
  "maku.trendscore.co.ke"
  "app.maku.trendscore.co.ke"
  "api.maku.trendscore.co.ke"
  "files.maku.trendscore.co.ke"
)
EMAIL="admin@trendscore.co.ke"   # change to your email
STAGING=0                        # set to 1 to test without hitting rate limits

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "==> Starting Nginx for ACME challenge..."
$COMPOSE up -d nginx

# Request certs for each subdomain separately so each has its own cert file
# (matches the nginx config which expects per-subdomain cert paths)
for domain in "${DOMAINS[@]}"; do
  echo "==> Requesting certificate for $domain ..."

  staging_arg=""
  if [ "$STAGING" = "1" ]; then
    staging_arg="--staging"
  fi

  docker run --rm \
    -v "maku-prod_letsencrypt_certs:/etc/letsencrypt" \
    -v "maku-prod_certbot_webroot:/var/www/certbot" \
    certbot/certbot:v2.11.0 certonly \
      --webroot \
      --webroot-path=/var/www/certbot \
      --email "$EMAIL" \
      --agree-tos \
      --no-eff-email \
      $staging_arg \
      -d "$domain"

  echo "==> Certificate for $domain issued."
done

echo "==> Reloading Nginx with new certificates..."
$COMPOSE exec nginx nginx -s reload

echo ""
echo "==> SSL setup complete!"
echo "    Certificates will auto-renew via the certbot service in docker-compose.prod.yml."
