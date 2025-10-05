#!/bin/bash

# Скрипт для очистки кэша Redis
# Usage: ./ops/clear_cache.sh

set -e  # Exit on any error

echo "=== BoltPromo Cache Clearer ==="
echo ""

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_DB="${REDIS_DB:-0}"

echo "Redis: ${REDIS_HOST}:${REDIS_PORT} (db: ${REDIS_DB})"
echo ""

# Подтверждение
read -p "This will clear ALL cache data. Continue? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "Cache clear cancelled."
    exit 0
fi

echo ""
echo "Clearing cache..."

# Метод 1: Через Django management command
if [ -f "backend/manage.py" ]; then
    echo "Using Django cache clear..."
    cd backend
    python manage.py clear_cache 2>/dev/null || python -c "
from django.core.cache import cache
cache.clear()
print('Cache cleared via Django')
" 2>/dev/null || true
    cd ..
fi

# Метод 2: Напрямую через Redis CLI
if command -v redis-cli &> /dev/null; then
    echo "Flushing Redis database ${REDIS_DB}..."
    redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -n "${REDIS_DB}" FLUSHDB
else
    echo "⚠️  redis-cli not found, skipping direct Redis flush"
fi

# Очистка Django sessions (опционально)
read -p "Also clear Django sessions? (yes/no): " CLEAR_SESSIONS
if [ "${CLEAR_SESSIONS}" == "yes" ]; then
    echo "Clearing Django sessions..."
    cd backend
    python manage.py clearsessions
    cd ..
fi

echo ""
echo "✅ Cache cleared successfully!"
echo "Done!"
