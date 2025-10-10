#!/bin/bash
# ===========================================
# BoltPromo Main Deployment Script
# ===========================================
# Полный процесс деплоя для production
# Безопасный, идемпотентный, с логированием

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/var/www/boltpromo"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_PATH="$PROJECT_ROOT/venv"
LOG_DIR="/var/log/boltpromo"
BACKUP_DIR="/var/backups/boltpromo"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
    log_error "Do not run this script as root. Use www-data or appropriate user."
    exit 1
fi

log "=========================================="
log "BoltPromo Production Deploy Started"
log "Timestamp: $TIMESTAMP"
log "=========================================="

# Step 1: Pre-deployment checks
log "Step 1/8: Pre-deployment checks..."

if [ ! -f "$BACKEND_DIR/.env" ]; then
    log_error "Backend .env file not found!"
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    log_error "Frontend .env.production file not found!"
    exit 1
fi

log "✓ Environment files present"

# Step 2: Create backup
log "Step 2/8: Creating database backup..."
mkdir -p "$BACKUP_DIR"

if command -v pg_dump &> /dev/null; then
    source "$BACKEND_DIR/.env"
    PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    log "✓ Database backup created: db_backup_$TIMESTAMP.sql"
else
    log_warning "pg_dump not found, skipping database backup"
fi

# Step 3: Pull latest code
log "Step 3/8: Pulling latest code from git..."
cd "$PROJECT_ROOT"

# Stash any local changes
git stash save "Auto-stash before deploy $TIMESTAMP" || true

# Pull latest changes
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Current branch: $CURRENT_BRANCH"
git pull origin "$CURRENT_BRANCH"

CURRENT_COMMIT=$(git rev-parse --short HEAD)
log "✓ Updated to commit: $CURRENT_COMMIT"

# Step 4: Backend deployment
log "Step 4/8: Deploying backend..."
cd "$BACKEND_DIR"

# Activate virtual environment
source "$VENV_PATH/bin/activate"

# Install/update dependencies
log "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir

# Run migrations
log "Running database migrations..."
python manage.py migrate --no-input

# Collect static files
log "Collecting static files..."
python manage.py collectstatic --no-input --clear

# Run Django deployment checks
log "Running Django security checks..."
python manage.py check --deploy --fail-level WARNING

log "✓ Backend deployed successfully"

# Step 5: Frontend deployment
log "Step 5/8: Deploying frontend..."
cd "$FRONTEND_DIR"

# Install/update dependencies
log "Installing Node.js dependencies..."
npm ci --production=false

# Build frontend
log "Building Next.js application..."
npm run build

log "✓ Frontend deployed successfully"

# Step 6: Restart services
log "Step 6/8: Restarting services..."

# Backend services
sudo systemctl restart gunicorn
log "✓ Gunicorn restarted"

sudo systemctl restart celery
log "✓ Celery worker restarted"

sudo systemctl restart celerybeat
log "✓ Celery beat restarted"

# Frontend service
if command -v pm2 &> /dev/null; then
    pm2 restart nextjs || pm2 start npm --name "nextjs" -- start
    log "✓ Next.js (PM2) restarted"
else
    log_warning "PM2 not found, please restart Next.js manually"
fi

# Step 7: Health checks
log "Step 7/8: Running health checks..."

# Wait for services to start
sleep 5

# Check Gunicorn
if systemctl is-active --quiet gunicorn; then
    log "✓ Gunicorn is active"
else
    log_error "Gunicorn is not running!"
    systemctl status gunicorn
    exit 1
fi

# Check Celery
if systemctl is-active --quiet celery; then
    log "✓ Celery worker is active"
else
    log_error "Celery is not running!"
    systemctl status celery
    exit 1
fi

# Check Celery Beat
if systemctl is-active --quiet celerybeat; then
    log "✓ Celery beat is active"
else
    log_error "Celery beat is not running!"
    systemctl status celerybeat
    exit 1
fi

# Test backend API endpoint
if curl -s -f http://localhost:8000/api/v1/health/ > /dev/null 2>&1; then
    log "✓ Backend API is responding"
else
    log_warning "Backend API health check failed"
fi

# Test frontend
if curl -s -f http://localhost:3000/ > /dev/null 2>&1; then
    log "✓ Frontend is responding"
else
    log_warning "Frontend health check failed"
fi

# Step 8: Cleanup
log "Step 8/8: Cleaning up..."

# Remove old backups (keep last 7 days)
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +7 -delete
log "✓ Old backups cleaned"

# Clear Python cache
cd "$BACKEND_DIR"
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
log "✓ Python cache cleared"

log "=========================================="
log "Deploy completed successfully!"
log "Commit: $CURRENT_COMMIT"
log "Timestamp: $TIMESTAMP"
log "=========================================="
log ""
log "Next steps:"
log "1. Check logs: tail -f $LOG_DIR/gunicorn-error.log"
log "2. Monitor Celery: tail -f $LOG_DIR/celery.log"
log "3. Test frontend: https://yourdomain.ru"
log "4. Test backend: https://api.yourdomain.ru/admin"
log ""
log "Backup location: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"
