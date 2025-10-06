#!/bin/bash
# ================================================
# BoltPromo Database Backup Script
# ================================================
# Автоматический backup PostgreSQL базы данных
# с загрузкой в локальную папку и опционально S3

set -e  # Exit on error

# ================================================
# Конфигурация (можно переопределить через env)
# ================================================
BACKUP_DIR="${BACKUP_DIR:-/var/backups/boltpromo}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_NAME="${DB_NAME:-boltpromo}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Опционально: S3 bucket для remote backup
S3_BUCKET="${S3_BUCKET:-}"
ENABLE_S3_UPLOAD="${ENABLE_S3_UPLOAD:-false}"

# ================================================
# Функции
# ================================================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# ================================================
# Основная логика
# ================================================
log "Starting PostgreSQL backup for database: $DB_NAME"

# Создать директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Генерация имени файла
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/boltpromo_${TIMESTAMP}.sql.gz"

# Выполнить backup
log "Creating backup: $BACKUP_FILE"

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=custom \
    --compress=9 \
    --verbose \
    2>&1 | gzip > "$BACKUP_FILE"

# Проверка успешности
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✅ Backup successful: $BACKUP_FILE (size: $BACKUP_SIZE)"
else
    log "❌ Backup FAILED"
    exit 1
fi

# Загрузка в S3 (опционально)
if [ "$ENABLE_S3_UPLOAD" = "true" ] && [ -n "$S3_BUCKET" ]; then
    log "Uploading to S3: $S3_BUCKET"
    if command -v aws &> /dev/null; then
        aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/" --storage-class STANDARD_IA
        log "✅ S3 upload successful"
    else
        log "⚠️ AWS CLI not found, skipping S3 upload"
    fi
fi

# Очистка старых бэкапов
log "Cleaning up old backups (retention: $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "boltpromo_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
log "✅ Cleanup completed"

# Вывести список оставшихся бэкапов
log "Current backups:"
ls -lh "$BACKUP_DIR"/boltpromo_*.sql.gz 2>/dev/null || log "No backups found"

log "Backup process completed successfully"
