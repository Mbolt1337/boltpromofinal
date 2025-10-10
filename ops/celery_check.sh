#!/bin/bash
# ===========================================
# Celery Health Check Script
# ===========================================
# Проверка работоспособности Celery workers и beat
# Можно использовать для мониторинга и алертинга

set -u  # Exit on undefined variable

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="${PROJECT_ROOT:-/var/www/boltpromo}"
BACKEND_DIR="$PROJECT_ROOT/backend"
VENV_PATH="${VENV_PATH:-$PROJECT_ROOT/venv}"

# Exit codes
EXIT_OK=0
EXIT_WARNING=1
EXIT_CRITICAL=2
EXIT_UNKNOWN=3

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log "=========================================="
log "Celery Health Check"
log "=========================================="

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Backend directory not found: $BACKEND_DIR"
    exit $EXIT_UNKNOWN
fi

cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -f "$VENV_PATH/bin/activate" ]; then
    log_error "Virtual environment not found: $VENV_PATH"
    exit $EXIT_UNKNOWN
fi

# Activate virtual environment
source "$VENV_PATH/bin/activate"

# Check if Celery is installed
if ! python -c "import celery" 2>/dev/null; then
    log_error "Celery is not installed in the virtual environment"
    exit $EXIT_UNKNOWN
fi

# Exit code tracker
OVERALL_STATUS=$EXIT_OK

# Step 1: Check if systemd services are running
log "Step 1/5: Checking systemd services..."

if systemctl is-active --quiet celery; then
    log "✓ Celery worker service is active"
else
    log_error "Celery worker service is not running"
    systemctl status celery --no-pager || true
    OVERALL_STATUS=$EXIT_CRITICAL
fi

if systemctl is-active --quiet celerybeat; then
    log "✓ Celery beat service is active"
else
    log_warning "Celery beat service is not running"
    OVERALL_STATUS=$EXIT_WARNING
fi

# Step 2: Check Redis connection
log "Step 2/5: Checking Redis connection..."

if [ -f ".env" ]; then
    source .env
    REDIS_HOST=$(echo "${REDIS_URL:-redis://localhost:6379/0}" | sed -E 's|redis://([^:]+).*|\1|')
    REDIS_PORT=$(echo "${REDIS_URL:-redis://localhost:6379/0}" | sed -E 's|redis://[^:]+:([0-9]+).*|\1|')

    if command -v redis-cli &> /dev/null; then
        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null 2>&1; then
            log "✓ Redis is responding"
        else
            log_error "Redis is not responding at $REDIS_HOST:$REDIS_PORT"
            OVERALL_STATUS=$EXIT_CRITICAL
        fi
    else
        log_warning "redis-cli not found, skipping Redis check"
    fi
else
    log_warning ".env file not found, skipping Redis check"
fi

# Step 3: Check active workers using Celery inspect
log "Step 3/5: Checking active Celery workers..."

WORKERS_OUTPUT=$(python -c "
from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')

try:
    inspect = app.control.inspect(timeout=5)
    active = inspect.active()

    if active:
        print('WORKERS_FOUND')
        for worker, tasks in active.items():
            print(f'{worker}:{len(tasks)}')
    else:
        print('NO_WORKERS')
except Exception as e:
    print(f'ERROR:{e}')
" 2>&1)

if echo "$WORKERS_OUTPUT" | grep -q "WORKERS_FOUND"; then
    WORKER_COUNT=$(echo "$WORKERS_OUTPUT" | grep -c ":" || echo "0")
    log "✓ Found $WORKER_COUNT active worker(s)"

    # Show worker details
    echo "$WORKERS_OUTPUT" | grep ":" | while read -r line; do
        WORKER_NAME=$(echo "$line" | cut -d: -f1)
        TASK_COUNT=$(echo "$line" | cut -d: -f2)
        log_info "  - $WORKER_NAME: $TASK_COUNT active task(s)"
    done
elif echo "$WORKERS_OUTPUT" | grep -q "NO_WORKERS"; then
    log_error "No active Celery workers found"
    OVERALL_STATUS=$EXIT_CRITICAL
else
    log_error "Failed to check workers: $WORKERS_OUTPUT"
    OVERALL_STATUS=$EXIT_CRITICAL
fi

# Step 4: Check registered tasks
log "Step 4/5: Checking registered tasks..."

TASKS_OUTPUT=$(python -c "
from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')

try:
    inspect = app.control.inspect(timeout=5)
    registered = inspect.registered()

    if registered:
        task_count = 0
        for worker, tasks in registered.items():
            task_count += len(tasks)
        print(f'TASKS:{task_count}')
    else:
        print('NO_TASKS')
except Exception as e:
    print(f'ERROR:{e}')
" 2>&1)

if echo "$TASKS_OUTPUT" | grep -q "TASKS:"; then
    TASK_COUNT=$(echo "$TASKS_OUTPUT" | sed 's/TASKS://')
    log "✓ $TASK_COUNT task(s) registered"
else
    log_warning "No registered tasks found or check failed"
fi

# Step 5: Check scheduled tasks (beat)
log "Step 5/5: Checking Celery Beat schedule..."

if [ -f "celerybeat-schedule.db" ]; then
    SCHEDULE_SIZE=$(stat -f%z "celerybeat-schedule.db" 2>/dev/null || stat -c%s "celerybeat-schedule.db" 2>/dev/null || echo "0")

    if [ "$SCHEDULE_SIZE" -gt 0 ]; then
        log "✓ Celery Beat schedule exists (${SCHEDULE_SIZE} bytes)"
    else
        log_warning "Celery Beat schedule file is empty"
        OVERALL_STATUS=$EXIT_WARNING
    fi
else
    log_warning "Celery Beat schedule file not found (may not be configured)"
fi

# Summary
log "=========================================="

case $OVERALL_STATUS in
    $EXIT_OK)
        log "✓ All checks passed - Celery is healthy"
        ;;
    $EXIT_WARNING)
        log_warning "Some non-critical issues detected"
        ;;
    $EXIT_CRITICAL)
        log_error "Critical issues detected - Celery is unhealthy"
        ;;
    $EXIT_UNKNOWN)
        log_error "Unable to determine Celery status"
        ;;
esac

log "=========================================="

# Additional diagnostics on failure
if [ $OVERALL_STATUS -ne $EXIT_OK ]; then
    log ""
    log "Troubleshooting commands:"
    log "  - Check worker logs: journalctl -u celery -n 50"
    log "  - Check beat logs: journalctl -u celerybeat -n 50"
    log "  - Restart workers: sudo systemctl restart celery"
    log "  - Restart beat: sudo systemctl restart celerybeat"
    log "  - Manual worker start: celery -A config worker --loglevel=info"
    log "  - Manual beat start: celery -A config beat --loglevel=info"
fi

exit $OVERALL_STATUS
