#!/bin/bash
# ===========================================
# Django Database Migration Script
# ===========================================
# Безопасное применение миграций с проверками
# Идемпотентный - можно запускать многократно

set -e  # Exit on error
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
BACKUP_DIR="${BACKUP_DIR:-/var/backups/boltpromo}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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
log "Django Database Migration"
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

# Load database credentials
source .env

# Step 1: Check for pending migrations
log "Step 1/5: Checking for pending migrations..."

PENDING=$(python manage.py showmigrations --plan | grep -c "\[ \]" || echo "0")

if [ "$PENDING" -eq 0 ]; then
    log_info "No pending migrations found. Database is up to date."
    log "=========================================="
    exit 0
fi

log_info "Found $PENDING pending migration(s)"

# Show pending migrations
log_info "Pending migrations:"
python manage.py showmigrations --plan | grep "\[ \]" | sed 's/^/  /'

# Step 2: Create database backup (if possible)
log "Step 2/5: Creating database backup..."

mkdir -p "$BACKUP_DIR"

if command -v pg_dump &> /dev/null; then
    BACKUP_FILE="$BACKUP_DIR/pre_migration_$TIMESTAMP.sql"

    if [ -n "${DB_PASSWORD:-}" ]; then
        PGPASSWORD="$DB_PASSWORD" pg_dump -U "${DB_USER:-postgres}" -h "${DB_HOST:-localhost}" "${DB_NAME:-boltpromo}" > "$BACKUP_FILE"
        log "✓ Backup created: $BACKUP_FILE"
    else
        log_warning "DB_PASSWORD not set, skipping backup"
    fi
else
    log_warning "pg_dump not found, skipping backup"
fi

# Step 3: Run migration checks
log "Step 3/5: Running migration checks..."

# Check for migration conflicts
if python manage.py makemigrations --check --dry-run 2>&1 | grep -q "conflict"; then
    log_error "Migration conflicts detected! Please resolve conflicts before deploying."
    python manage.py makemigrations --check --dry-run
    exit 1
fi

# Check if there are any uncommitted migrations
UNCOMMITTED=$(python manage.py makemigrations --dry-run --no-input 2>&1)
if echo "$UNCOMMITTED" | grep -q "Migrations for"; then
    log_error "Uncommitted migrations detected!"
    log_error "Run 'python manage.py makemigrations' and commit the migration files before deploying."
    echo "$UNCOMMITTED"
    exit 1
fi

log "✓ No migration conflicts detected"

# Step 4: Test database connection
log "Step 4/5: Testing database connection..."

if python manage.py check --database default; then
    log "✓ Database connection successful"
else
    log_error "Database connection failed"
    exit 1
fi

# Step 5: Apply migrations
log "Step 5/5: Applying migrations..."
log_warning "This may take a few moments depending on the size of your database..."

# Run migrations with flags:
# --no-input: Non-interactive mode
# --verbosity 2: Show detailed output
if python manage.py migrate --no-input --verbosity 2; then
    log "✓ Migrations applied successfully"
else
    log_error "Migration failed!"
    log_error "To restore from backup, run:"
    log_error "  psql -U $DB_USER -h $DB_HOST $DB_NAME < $BACKUP_FILE"
    exit 1
fi

# Verify migrations were applied
log "Verifying migrations..."
PENDING_AFTER=$(python manage.py showmigrations --plan | grep -c "\[ \]" || echo "0")

if [ "$PENDING_AFTER" -eq 0 ]; then
    log "✓ All migrations applied successfully"
else
    log_warning "Still have $PENDING_AFTER pending migration(s)"
fi

# Show current migration state
log "Current migration state:"
python manage.py showmigrations | tail -n 20

log "=========================================="
log "Migration completed successfully"
log "Applied: $PENDING migration(s)"
log "Backup: $BACKUP_FILE"
log "=========================================="

log ""
log "Next steps:"
log "1. Check application logs for any issues"
log "2. Test affected functionality"
log "3. Monitor database performance"
log ""
log "If you encounter issues, restore from backup:"
log "  PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST $DB_NAME < $BACKUP_FILE"
