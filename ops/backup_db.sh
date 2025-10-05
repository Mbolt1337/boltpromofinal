#!/bin/bash

# Скрипт для создания резервной копии базы данных PostgreSQL
# Usage: ./ops/backup_db.sh

set -e  # Exit on any error

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Параметры по умолчанию
DB_NAME="${POSTGRES_DB:-boltpromo}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

# Создаем директорию для бэкапов
mkdir -p "${BACKUP_DIR}"

echo "=== BoltPromo Database Backup ==="
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Создаем бэкап БД
echo "Creating database backup..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -F c \
    -b \
    -v \
    -f "${BACKUP_FILE%.gz}" \
    "${DB_NAME}"

# Сжимаем бэкап
echo "Compressing backup..."
gzip "${BACKUP_FILE%.gz}"

# Создаем бэкап медиафайлов
MEDIA_BACKUP="${BACKUP_DIR}/media_backup_${TIMESTAMP}.tar.gz"
if [ -d "backend/media" ]; then
    echo "Backing up media files..."
    tar -czf "${MEDIA_BACKUP}" backend/media/
    echo "Media backup created: ${MEDIA_BACKUP}"
fi

# Показываем информацию о бэкапе
echo ""
echo "✅ Backup completed successfully!"
echo "Database backup: ${BACKUP_FILE}"
echo "Size: $(du -h ${BACKUP_FILE} | cut -f1)"

# Удаляем старые бэкапы (старше 7 дней)
echo ""
echo "Cleaning up old backups (>7 days)..."
find "${BACKUP_DIR}" -name "*.sql.gz" -type f -mtime +7 -delete
find "${BACKUP_DIR}" -name "*.tar.gz" -type f -mtime +7 -delete

echo "Done!"
