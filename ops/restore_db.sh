#!/bin/bash

# Скрипт для восстановления базы данных из резервной копии
# Usage: ./ops/restore_db.sh <backup_file>

set -e  # Exit on any error

if [ -z "$1" ]; then
    echo "Error: Backup file not specified"
    echo "Usage: ./ops/restore_db.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Параметры по умолчанию
DB_NAME="${POSTGRES_DB:-boltpromo}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "=== BoltPromo Database Restore ==="
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "Backup file: ${BACKUP_FILE}"
echo ""

# Подтверждение
read -p "⚠️  This will OVERWRITE the current database. Continue? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Разархивируем бэкап если нужно
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "Decompressing backup..."
    TEMP_FILE=$(mktemp)
    gunzip -c "${BACKUP_FILE}" > "${TEMP_FILE}"
    RESTORE_FILE="${TEMP_FILE}"
else
    RESTORE_FILE="${BACKUP_FILE}"
fi

# Останавливаем приложение
echo "Stopping application..."
./ops/restart_services.sh stop 2>/dev/null || true

# Удаляем существующую БД и создаем новую
echo "Recreating database..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS ${DB_NAME};"

PGPASSWORD="${POSTGRES_PASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d postgres \
    -c "CREATE DATABASE ${DB_NAME};"

# Восстанавливаем бэкап
echo "Restoring database..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_restore \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -v \
    "${RESTORE_FILE}"

# Удаляем временный файл
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    rm -f "${TEMP_FILE}"
fi

# Запускаем миграции
echo "Running migrations..."
cd backend
python manage.py migrate --noinput
cd ..

# Перезапускаем приложение
echo "Starting application..."
./ops/restart_services.sh start

echo ""
echo "✅ Database restored successfully!"
echo "Done!"
