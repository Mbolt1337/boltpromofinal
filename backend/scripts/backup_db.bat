@echo off
REM ================================================
REM BoltPromo Database Backup Script (Windows)
REM ================================================
REM Автоматический backup PostgreSQL базы данных

setlocal enabledelayedexpansion

REM ================================================
REM Конфигурация
REM ================================================
if "%BACKUP_DIR%"=="" set BACKUP_DIR=C:\backups\boltpromo
if "%RETENTION_DAYS%"=="" set RETENTION_DAYS=30
if "%DB_NAME%"=="" set DB_NAME=boltpromo
if "%DB_USER%"=="" set DB_USER=postgres
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432

REM ================================================
REM Основная логика
REM ================================================
echo [%date% %time%] Starting PostgreSQL backup for database: %DB_NAME%

REM Создать директорию для бэкапов
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Генерация имени файла
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do set DATESTAMP=%%c%%b%%a
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set TIMESTAMP=%%a%%b
set BACKUP_FILE=%BACKUP_DIR%\boltpromo_%DATESTAMP%_%TIMESTAMP%.sql

echo [%date% %time%] Creating backup: %BACKUP_FILE%

REM Выполнить backup
pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% --format=custom --compress=9 > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] ✅ Backup successful: %BACKUP_FILE%
) else (
    echo [%date% %time%] ❌ Backup FAILED
    exit /b 1
)

REM Очистка старых бэкапов (Windows не имеет встроенного find -mtime)
echo [%date% %time%] Cleaning up old backups (retention: %RETENTION_DAYS% days)
forfiles /p "%BACKUP_DIR%" /m boltpromo_*.sql /d -%RETENTION_DAYS% /c "cmd /c del @path" 2>nul

echo [%date% %time%] Current backups:
dir /b "%BACKUP_DIR%\boltpromo_*.sql" 2>nul

echo [%date% %time%] Backup process completed successfully
