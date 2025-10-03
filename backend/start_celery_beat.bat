@echo off
REM Start Celery Beat scheduler for BoltPromo
echo Starting Celery Beat...
cd /d "%~dp0"
celery -A config beat --loglevel=info
