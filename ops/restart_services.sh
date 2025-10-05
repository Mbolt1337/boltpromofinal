#!/bin/bash

# Скрипт для перезапуска сервисов BoltPromo
# Usage: ./ops/restart_services.sh [start|stop|restart|status]

set -e  # Exit on any error

ACTION="${1:-restart}"

# Функция для остановки сервисов
stop_services() {
    echo "Stopping BoltPromo services..."

    # Останавливаем Gunicorn
    if [ -f "gunicorn.pid" ]; then
        PID=$(cat gunicorn.pid)
        echo "Stopping Gunicorn (PID: ${PID})..."
        kill -TERM ${PID} 2>/dev/null || true
        rm -f gunicorn.pid
    fi

    # Останавливаем Celery worker
    if [ -f "celery_worker.pid" ]; then
        PID=$(cat celery_worker.pid)
        echo "Stopping Celery worker (PID: ${PID})..."
        kill -TERM ${PID} 2>/dev/null || true
        rm -f celery_worker.pid
    fi

    # Останавливаем Celery beat
    if [ -f "celery_beat.pid" ]; then
        PID=$(cat celery_beat.pid)
        echo "Stopping Celery beat (PID: ${PID})..."
        kill -TERM ${PID} 2>/dev/null || true
        rm -f celery_beat.pid
    fi

    # Останавливаем Next.js (если запущен через PM2)
    pm2 stop boltpromo-frontend 2>/dev/null || true

    echo "✅ Services stopped"
}

# Функция для запуска сервисов
start_services() {
    echo "Starting BoltPromo services..."

    # Загружаем переменные окружения
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi

    # Запускаем Gunicorn
    echo "Starting Gunicorn..."
    cd backend
    gunicorn config.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --timeout 120 \
        --access-logfile ../logs/gunicorn_access.log \
        --error-logfile ../logs/gunicorn_error.log \
        --pid ../gunicorn.pid \
        --daemon
    cd ..

    # Запускаем Celery worker
    echo "Starting Celery worker..."
    cd backend
    celery -A config worker \
        --loglevel=info \
        --logfile=../logs/celery_worker.log \
        --pidfile=../celery_worker.pid \
        --detach
    cd ..

    # Запускаем Celery beat
    echo "Starting Celery beat..."
    cd backend
    celery -A config beat \
        --loglevel=info \
        --logfile=../logs/celery_beat.log \
        --pidfile=../celery_beat.pid \
        --detach
    cd ..

    # Запускаем Next.js (production)
    echo "Starting Next.js..."
    cd frontend
    pm2 start npm --name "boltpromo-frontend" -- start 2>/dev/null || npm run start &
    cd ..

    echo "✅ Services started"
}

# Функция для проверки статуса
status_services() {
    echo "=== BoltPromo Services Status ==="
    echo ""

    # Проверяем Gunicorn
    if [ -f "gunicorn.pid" ] && ps -p $(cat gunicorn.pid) > /dev/null 2>&1; then
        echo "✅ Gunicorn: Running (PID: $(cat gunicorn.pid))"
    else
        echo "❌ Gunicorn: Stopped"
    fi

    # Проверяем Celery worker
    if [ -f "celery_worker.pid" ] && ps -p $(cat celery_worker.pid) > /dev/null 2>&1; then
        echo "✅ Celery worker: Running (PID: $(cat celery_worker.pid))"
    else
        echo "❌ Celery worker: Stopped"
    fi

    # Проверяем Celery beat
    if [ -f "celery_beat.pid" ] && ps -p $(cat celery_beat.pid) > /dev/null 2>&1; then
        echo "✅ Celery beat: Running (PID: $(cat celery_beat.pid))"
    else
        echo "❌ Celery beat: Stopped"
    fi

    # Проверяем Next.js
    if pm2 list 2>/dev/null | grep -q "boltpromo-frontend"; then
        echo "✅ Next.js: Running"
        pm2 show boltpromo-frontend 2>/dev/null | grep -E "status|uptime|cpu|memory"
    else
        echo "❌ Next.js: Stopped"
    fi
}

# Основная логика
case "${ACTION}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    status)
        status_services
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

echo "Done!"
