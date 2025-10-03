# Celery для BoltPromo

## Установка Redis (требуется для Celery)

### Windows
1. Скачать Redis для Windows: https://github.com/tporadowski/redis/releases
2. Установить и запустить `redis-server.exe`

### Linux/Mac
```bash
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS
redis-server
```

## Запуск Celery

### Windows

**Терминал 1 - Worker:**
```cmd
start_celery_worker.bat
```

**Терминал 2 - Beat (планировщик):**
```cmd
start_celery_beat.bat
```

### Linux/Mac

**Терминал 1 - Worker:**
```bash
celery -A config worker --loglevel=info
```

**Терминал 2 - Beat:**
```bash
celery -A config beat --loglevel=info
```

## Задачи

### Автоматические (по расписанию)

1. **aggregate_events_hourly** - каждый час
   - Агрегирует события (Events) в дневную статистику (DailyAgg)

2. **cleanup_old_events** - раз в день
   - Удаляет сырые события старше 30 дней

3. **cleanup_redis_dedup_keys** - каждые 6 часов
   - Очищает устаревшие ключи дедупликации в Redis

### Ручные

```python
# В Django shell или через админку
from core.tasks import aggregate_events_hourly, generate_site_assets

# Запустить агрегацию вручную
aggregate_events_hourly.delay()

# Сгенерировать медиа для SiteAssets
generate_site_assets.delay(asset_id=1)
```

## Проверка статуса

```bash
# Проверить подключение к Redis
redis-cli ping

# Список активных задач
celery -A config inspect active

# Зарегистрированные задачи
celery -A config inspect registered
```

## Production

Для production рекомендуется использовать supervisor/systemd для автоматического запуска:

```ini
# /etc/supervisor/conf.d/boltpromo-celery.conf
[program:boltpromo-worker]
command=/path/to/venv/bin/celery -A config worker --loglevel=info
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true

[program:boltpromo-beat]
command=/path/to/venv/bin/celery -A config beat --loglevel=info
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
```
