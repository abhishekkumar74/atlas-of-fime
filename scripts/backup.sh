#!/bin/bash
# ==============================================================================
# ATLAS OF TIME — AUTOMATED SUPABASE DATABASE BACKUP SCRIPT
# Exports complete PostgreSQL schema & data to timestamped compressed SQL files
# ==============================================================================

set -e

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/supabase_backup_${TIMESTAMP}.sql"
GZ_FILE="${BACKUP_FILE}.gz"

# Create backups directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "📦 Starting automated Supabase database backup..."

# Extract DB host and reference from VITE_SUPABASE_URL
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "❌ Error: VITE_SUPABASE_URL environment variable is missing."
  exit 1
fi

PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="postgres"

echo "🔗 Target Database Host: ${DB_HOST}"

# Execute pg_dump if SUPABASE_DB_PASSWORD is provided, or print backup instructions
if [ -n "$SUPABASE_DB_PASSWORD" ]; then
  PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -F p \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges > "${BACKUP_FILE}"

  # Compress backup file
  gzip -f "${BACKUP_FILE}"
  echo "✅ Backup successfully created and compressed: ${GZ_FILE}"

  # Clean up backups older than 30 days
  find "${BACKUP_DIR}" -type f -name "*.sql.gz" -mtime +30 -delete
  echo "🧹 Cleaned up backups older than 30 days."
else
  echo "ℹ️ Note: Set SUPABASE_DB_PASSWORD in your .env file to enable direct CLI pg_dump execution."
  echo "💡 You can also export database backups anytime directly from Supabase Dashboard:"
  echo "   1. Open https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database"
  echo "   2. Scroll to Database Backups ➔ Download Latest Daily Backup."
fi
