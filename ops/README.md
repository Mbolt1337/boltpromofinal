# BoltPromo Operations Scripts

Набор bash-скриптов для управления production-окружением BoltPromo.

## Требования

- PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`)
- Redis CLI (опционально, для `clear_cache.sh`)
- PM2 (для управления Next.js в `restart_services.sh`)
- Python 3.x с установленным Django

## Скрипты

### 1. `backup_db.sh` - Резервное копирование БД

Создает резервную копию PostgreSQL базы данных и медиафайлов.

```bash
./ops/backup_db.sh
```

**Особенности:**
- Создает сжатый дамп БД в `./backups/db_backup_YYYYMMDD_HHMMSS.sql.gz`
- Бэкапит медиафайлы в `./backups/media_backup_YYYYMMDD_HHMMSS.tar.gz`
- Автоматически удаляет бэкапы старше 7 дней
- Использует переменные из `.env` (POSTGRES_DB, POSTGRES_USER, и т.д.)

### 2. `restore_db.sh` - Восстановление из бэкапа

Восстанавливает базу данных из резервной копии.

```bash
./ops/restore_db.sh ./backups/db_backup_20250101_120000.sql.gz
```

**Особенности:**
- Поддерживает `.gz` архивы (автоматическая распаковка)
- Останавливает сервисы перед восстановлением
- Пересоздает БД
- Запускает миграции после восстановления
- Перезапускает сервисы

**⚠️ ВНИМАНИЕ:** Полностью перезаписывает текущую БД!

### 3. `restart_services.sh` - Управление сервисами

Управляет всеми сервисами BoltPromo (Gunicorn, Celery, Next.js).

```bash
./ops/restart_services.sh [start|stop|restart|status]
```

**Команды:**
- `start` - Запустить все сервисы
- `stop` - Остановить все сервисы
- `restart` - Перезапустить все сервисы
- `status` - Проверить статус сервисов

**Управляемые сервисы:**
- Gunicorn (Django backend, порт 8000)
- Celery worker
- Celery beat
- Next.js frontend (через PM2 или фоновый процесс)

### 4. `seed_demo.sh` - Наполнение демо-данными

Наполняет пустую БД демонстрационными данными.

```bash
./ops/seed_demo.sh
```

**Создает:**
- Категории (Электроника, Одежда, Красота, и т.д.)
- Магазины (50+ демо-магазинов)
- Промокоды (100+ актуальных предложений)
- Подборки (Showcases)
- Баннеры

**Примечание:** Использует Django management command `seed_demo`.

### 5. `clear_cache.sh` - Очистка кэша

Очищает Redis кэш и опционально Django sessions.

```bash
./ops/clear_cache.sh
```

**Очищает:**
- Redis database (через `FLUSHDB`)
- Django cache (через management command или Python API)
- Django sessions (опционально)

## Переменные окружения

Все скрипты используют переменные из файла `.env` в корне проекта:

```env
# PostgreSQL
POSTGRES_DB=boltpromo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

## Логи

Логи сервисов сохраняются в директории `./logs/`:
- `gunicorn_access.log`
- `gunicorn_error.log`
- `celery_worker.log`
- `celery_beat.log`

## Примеры использования

### Создание бэкапа перед обновлением

```bash
# 1. Создать бэкап
./ops/backup_db.sh

# 2. Выполнить обновление кода
git pull origin main

# 3. Перезапустить сервисы
./ops/restart_services.sh restart
```

### Восстановление после сбоя

```bash
# 1. Найти последний бэкап
ls -lh ./backups/*.sql.gz

# 2. Восстановить
./ops/restore_db.sh ./backups/db_backup_20250101_120000.sql.gz

# 3. Очистить кэш
./ops/clear_cache.sh
```

### Развертывание на новом сервере

```bash
# 1. Настроить .env файл
cp .env.example .env
nano .env

# 2. Наполнить БД демо-данными
./ops/seed_demo.sh

# 3. Запустить сервисы
./ops/restart_services.sh start

# 4. Проверить статус
./ops/restart_services.sh status
```

## Автоматизация

### Cron для автоматических бэкапов

Добавьте в crontab (`crontab -e`):

```cron
# Ежедневный бэкап в 3:00
0 3 * * * /path/to/boltpromo/ops/backup_db.sh >> /path/to/logs/backup.log 2>&1

# Еженедельная очистка кэша по воскресеньям в 4:00
0 4 * * 0 /path/to/boltpromo/ops/clear_cache.sh << EOF
yes
no
EOF
```

## Безопасность

- Не коммитьте файлы бэкапов в Git (добавлены в `.gitignore`)
- Храните пароли в `.env`, а не в скриптах
- Ограничьте права доступа к скриптам: `chmod 700 ops/*.sh`
- Регулярно проверяйте и удаляйте старые бэкапы

## Поддержка

При возникновении проблем:
1. Проверьте логи в `./logs/`
2. Убедитесь, что `.env` настроен корректно
3. Проверьте права доступа к файлам и директориям
4. Убедитесь, что все зависимости установлены
