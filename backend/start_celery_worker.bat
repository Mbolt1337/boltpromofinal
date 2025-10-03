@echo off
REM Start Celery Worker for BoltPromo
echo Starting Celery Worker...
cd /d "%~dp0"
celery -A config worker --loglevel=info --pool=solo
