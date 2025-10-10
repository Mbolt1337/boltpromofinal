#!/bin/bash
# ===========================================
# BoltPromo Backup Script
# ===========================================
# Автоматическое резервное копирование БД и медиа
# Рекомендуется запускать через cron ежедневно

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="${PROJECT_ROOT:-/var/www/boltpromo}"
BACKEND_DIR="$PROJECT_ROOT/backend"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/boltpromo}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7  # Keep backups for 7 days

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log "=========================================="
log "BoltPromo Backup Script"
log "Timestamp: $TIMESTAMP"
log "=========================================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Load environment variables
if [ ! -f "$BACKEND_DIR/.env" ]; then
    log_error "Environment file not found: $BACKEND_DIR/.env"
    exit 1
fi

cd "$BACKEND_DIR"
source .env

# Step 1: Backup PostgreSQL database
log "Step 1/3: Backing up PostgreSQL database..."

DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

if command -v pg_dump &> /dev/null; then
    if [ -n "${DB_PASSWORD:-}" ] && [ -n "${DB_USER:-}" ] && [ -n "${DB_NAME:-}" ]; then
        log "Database: $DB_NAME"
        log "User: $DB_USER"
        log "Host: ${DB_HOST:-localhost}"

        # Dump and compress in one go
        PGPASSWORD="$DB_PASSWORD" pg_dump \
            -U "$DB_USER" \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            --verbose \
            --format=plain \
            --no-owner \
            --no-privileges \
            "$DB_NAME" | gzip > "$DB_BACKUP_FILE"

        DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
        log "✓ Database backup created: $DB_BACKUP_FILE ($DB_SIZE)"
    else
        log_error "Database credentials not properly configured in .env"
        exit 1
    fi
else
    log_error "pg_dump command not found. Install postgresql-client."
    exit 1
fi

# Step 2: Backup media files
log "Step 2/3: Backing up media files..."

MEDIA_DIR="$BACKEND_DIR/media"
MEDIA_BACKUP_FILE="$BACKUP_DIR/media_backup_$TIMESTAMP.tar.gz"

if [ -d "$MEDIA_DIR" ]; then
    # Count files before backup
    FILE_COUNT=$(find "$MEDIA_DIR" -type f | wc -l)

    if [ "$FILE_COUNT" -gt 0 ]; then
        log "Compressing $FILE_COUNT media files..."
        tar -czf "$MEDIA_BACKUP_FILE" -C "$BACKEND_DIR" media/

        MEDIA_SIZE=$(du -h "$MEDIA_BACKUP_FILE" | cut -f1)
        log "✓ Media backup created: $MEDIA_BACKUP_FILE ($MEDIA_SIZE)"
    else
        log_warning "No media files found, skipping media backup"
        # Create empty marker file
        touch "$BACKUP_DIR/media_empty_$TIMESTAMP.marker"
    fi
else
    log_warning "Media directory not found: $MEDIA_DIR"
fi

# Step 3: Backup environment file (without sensitive data)
log "Step 3/3: Creating environment template backup..."

ENV_BACKUP_FILE="$BACKUP_DIR/env_template_$TIMESTAMP.txt"

# Create sanitized copy of .env (replace sensitive values with placeholders)
if [ -f "$BACKEND_DIR/.env" ]; then
    sed -E 's/(PASSWORD|KEY|SECRET|DSN|TOKEN)=.*/\1=<REDACTED>/g' "$BACKEND_DIR/.env" > "$ENV_BACKUP_FILE"
    log "✓ Environment template saved: $ENV_BACKUP_FILE"
fi

# Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
cat > "$MANIFEST_FILE" << EOF
BoltPromo Backup Manifest
=========================
Backup Date: $(date +'%Y-%m-%d %H:%M:%S')
Timestamp: $TIMESTAMP

Files Created:
- Database: $DB_BACKUP_FILE ($DB_SIZE)
- Media: ${MEDIA_BACKUP_FILE:-N/A} (${MEDIA_SIZE:-N/A})
- Environment: $ENV_BACKUP_FILE

Database Info:
- Name: $DB_NAME
- User: $DB_USER
- Host: ${DB_HOST:-localhost}

Restore Commands:
-----------------
# Restore database:
gunzip < $DB_BACKUP_FILE | PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h ${DB_HOST:-localhost} $DB_NAME

# Restore media:
tar -xzf $MEDIA_BACKUP_FILE -C $BACKEND_DIR

# Verify database:
psql -U $DB_USER -h ${DB_HOST:-localhost} -d $DB_NAME -c "SELECT COUNT(*) FROM django_migrations;"
EOF

log "✓ Backup manifest created: $MANIFEST_FILE"

# Step 4: Cleanup old backups
log "=========================================="
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."

# Count files before cleanup
OLD_COUNT=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS | wc -l)

if [ "$OLD_COUNT" -gt 0 ]; then
    log "Found $OLD_COUNT old file(s) to remove"

    # Remove old database backups
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

    # Remove old media backups
    find "$BACKUP_DIR" -name "media_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

    # Remove old manifests
    find "$BACKUP_DIR" -name "backup_manifest_*.txt" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "env_template_*.txt" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "media_empty_*.marker" -mtime +$RETENTION_DAYS -delete

    log "✓ Old backups cleaned"
else
    log "No old backups to remove"
fi

# Show remaining backups
REMAINING_COUNT=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" | wc -l)
log "Backups retained: $REMAINING_COUNT"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "=========================================="
log "Backup completed successfully!"
log ""
log "Backup location: $BACKUP_DIR"
log "Total size: $TOTAL_SIZE"
log "Retention: $RETENTION_DAYS days"
log ""
log "Files created:"
log "  - $DB_BACKUP_FILE"
[ -f "$MEDIA_BACKUP_FILE" ] && log "  - $MEDIA_BACKUP_FILE"
log "  - $MANIFEST_FILE"
log "=========================================="

log ""
log "To restore this backup, see: $MANIFEST_FILE"
log ""
log "Cron setup (daily at 3 AM):"
log "  0 3 * * * $PROJECT_ROOT/ops/backup.sh >> /var/log/boltpromo/backup.log 2>&1"
