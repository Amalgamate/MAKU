#!/bin/bash
# ============================================================================
# MAKU Platform — Database Backup Script
# Runs a pg_dump and stores compressed backup in /backups.
# Add to cron: 0 2 * * * /path/to/maku/infra/scripts/backup.sh
# ============================================================================

set -euo pipefail

BACKUP_DIR="/backups/maku-postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="maku_db_${TIMESTAMP}.sql.gz"
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "==> Backing up MAKU database to $BACKUP_DIR/$FILENAME"

docker exec maku-postgres pg_dump \
  -U "${DB_USER:-maku_user}" \
  "${DB_NAME:-maku_db}" \
  | gzip > "$BACKUP_DIR/$FILENAME"

echo "==> Backup complete: $FILENAME"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "*.sql.gz" -mtime "+${KEEP_DAYS}" -delete
echo "==> Cleaned backups older than ${KEEP_DAYS} days"
