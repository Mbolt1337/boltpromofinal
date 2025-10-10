#!/bin/bash
# ===========================================
# Django Static Files Collection Script
# ===========================================
# Безопасный сбор статики с идемпотентностью
# Можно запускать многократно без побочных эффектов

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
VENV_PATH="${VENV_PATH:-$PROJECT_ROOT/venv}"
STATIC_ROOT="$BACKEND_DIR/staticfiles"

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
log "Django Static Files Collection"
log "=========================================="

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -f "$VENV_PATH/bin/activate" ]; then
    log_error "Virtual environment not found: $VENV_PATH"
    exit 1
fi

# Activate virtual environment
log "Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Check if Django is installed
if ! python -c "import django" 2>/dev/null; then
    log_error "Django is not installed in the virtual environment"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    log_error "Environment file (.env) not found in $BACKEND_DIR"
    exit 1
fi

# Get current DEBUG setting
DEBUG_VALUE=$(python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print(os.getenv('DEBUG', 'False'))
" 2>/dev/null || echo "unknown")

if [ "$DEBUG_VALUE" = "True" ]; then
    log_warning "DEBUG=True detected. Static files collection may behave differently in development."
fi

# Create static root directory if it doesn't exist
if [ ! -d "$STATIC_ROOT" ]; then
    log "Creating static root directory: $STATIC_ROOT"
    mkdir -p "$STATIC_ROOT"
fi

# Collect static files
log "Collecting static files..."
log "Target directory: $STATIC_ROOT"

# Run collectstatic with appropriate flags
# --no-input: Non-interactive mode
# --clear: Clear existing files before collecting
# --verbosity 1: Normal output
if python manage.py collectstatic --no-input --clear --verbosity 1; then
    log "✓ Static files collected successfully"
else
    log_error "Failed to collect static files"
    exit 1
fi

# Count collected files
FILE_COUNT=$(find "$STATIC_ROOT" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$STATIC_ROOT" 2>/dev/null | cut -f1)

log "=========================================="
log "Collection completed successfully"
log "Total files: $FILE_COUNT"
log "Total size: $TOTAL_SIZE"
log "Location: $STATIC_ROOT"
log "=========================================="

# Set proper permissions (optional, adjust based on your setup)
if [ "$EUID" -eq 0 ]; then
    log "Setting file permissions..."
    chown -R www-data:www-data "$STATIC_ROOT"
    find "$STATIC_ROOT" -type d -exec chmod 755 {} \;
    find "$STATIC_ROOT" -type f -exec chmod 644 {} \;
    log "✓ Permissions set"
else
    log_warning "Not running as root, skipping permission changes"
fi

log ""
log "Next steps:"
log "1. Verify files in: $STATIC_ROOT"
log "2. Check nginx configuration: /etc/nginx/sites-enabled/"
log "3. Test static files: https://yourdomain.ru/static/admin/css/base.css"
