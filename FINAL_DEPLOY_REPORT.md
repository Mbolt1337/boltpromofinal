# 🚀 BoltPromo - Production Deployment Report

**Дата создания:** 03.10.2025
**Версия:** 1.0.0
**Статус:** ✅ Готов к production деплою

---

## 📋 Содержание

- [Обзор изменений](#обзор-изменений)
- [Безопасность](#безопасность)
- [Производительность и кэширование](#производительность-и-кэширование)
- [Тестирование](#тестирование)
- [Конфигурация окружения](#конфигурация-окружения)
- [Инструкция по деплою](#инструкция-по-деплою)
- [Бэкапы и восстановление](#бэкапы-и-восстановление)
- [Чек-лист перед запуском](#чек-лист-перед-запуском)
- [Мониторинг и обслуживание](#мониторинг-и-обслуживание)

---

## 🎯 Обзор изменений

### ✅ Реализованные улучшения

#### 🔒 Безопасность и соответствие

1. **CSP и Security Headers** ✅
   - Content-Security-Policy (CSP) настроен для фронтенда и админки
   - X-Frame-Options: DENY
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy для отключения ненужных браузерных функций
   - X-Content-Type-Options: nosniff
   - Реализовано в `backend/core/middleware.py:159-211`

2. **HSTS (HTTP Strict Transport Security)** ✅
   - Включён для production (31536000 секунд = 1 год)
   - Включены субдомены (SECURE_HSTS_INCLUDE_SUBDOMAINS)
   - HSTS Preload готов
   - Конфигурация: `backend/config/settings.py:226-230`

3. **Secure Cookies** ✅
   - SESSION_COOKIE_SECURE = True
   - CSRF_COOKIE_SECURE = True
   - SESSION_COOKIE_HTTPONLY = True
   - CSRF_COOKIE_HTTPONLY = True
   - SESSION_COOKIE_SAMESITE = 'Lax'
   - Конфигурация: `backend/config/settings.py:237-244`

4. **Внешние ссылки** ✅
   - Все партнёрские ссылки имеют `rel="nofollow sponsored noopener noreferrer"`
   - Реализовано в `frontend/src/components/PromoActions.tsx:69, 102, 231, 252`

5. **Политика конфиденциальности и Cookie Consent** ✅
   - Полная политика конфиденциальности: `frontend/src/app/privacy/page.tsx`
   - Cookie consent баннер: `frontend/src/components/CookieConsent.tsx`
   - Интегрировано в layout: `frontend/src/app/layout.tsx:8, 203`
   - Поддержка выбора: только необходимые / все cookies

#### ⚡ Производительность и данные

6. **PostgreSQL и Redis в продакшене** ✅
   - Автоматическое переключение с SQLite на PostgreSQL при DEBUG=False
   - Конфигурация: `backend/config/settings.py:136-159`
   - Настройки подключения через переменные окружения

7. **Оптимизированное кэширование с версионированными ключами** ✅
   - Redis для production с версионированными ключами
   - 3 отдельных кэша: default, long_term, stats
   - Версионирование через CACHE_VERSION для инвалидации
   - Конфигурация: `backend/config/settings.py:161-237`
   - LocMemCache для development

8. **Оптимизация кэш-стратегии**
   - `default`: 5 минут (общие данные)
   - `long_term`: 30 минут (статичные данные: магазины, категории)
   - `stats`: 10 минут (статистика)
   - KEY_PREFIX для разделения окружений
   - Connection pooling (max_connections: 50)

#### 🧪 Тестирование

9. **Backend Unit Tests** ✅
   - Тесты для API трекинга событий (view, copy, open)
   - Тесты для агрегации событий (hourly aggregation)
   - Тесты для API статистики (топ промокоды, магазины)
   - Тесты для SiteAssets API и кэширования
   - Тесты для моделей (PromoCode, Showcase)
   - Файл: `backend/core/tests.py` (410 строк, 6 test suites)
   - Запуск: `python manage.py test core`

#### 🛠️ Конфигурация и инфраструктура

10. **Обновлённый .env.example** ✅
    - Полная документация всех переменных окружения
    - Секции: Django Core, PostgreSQL, Redis, Sentry, Email, Static/Media
    - Файл: `backend/.env.example`
    - Комментарии на русском языке

11. **Версионированные кэш-ключи**
    - CACHE_VERSION для глобальной инвалидации
    - Уникальные KEY_PREFIX для каждого кэша
    - Разделение по БД Redis (/0, /1, /2)

---

## 🔒 Безопасность

### Реализованные меры защиты

| Мера безопасности | Статус | Расположение |
|-------------------|--------|--------------|
| CSP Headers | ✅ | `backend/core/middleware.py:177-188` |
| X-Frame-Options | ✅ | `backend/core/middleware.py:191` |
| Referrer-Policy | ✅ | `backend/core/middleware.py:194` |
| Permissions-Policy | ✅ | `backend/core/middleware.py:197-205` |
| X-Content-Type-Options | ✅ | `backend/core/middleware.py:208` |
| HSTS | ✅ | `backend/config/settings.py:228-230` |
| Secure Cookies | ✅ | `backend/config/settings.py:237-244` |
| SSL Redirect | ✅ | `backend/config/settings.py:233-234` |
| CSRF Protection | ✅ | Django встроенный |
| Rate Limiting | ✅ | DRF Throttling |

### Content Security Policy

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
font-src 'self' data:
connect-src 'self'
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Примечание:** `unsafe-eval` требуется для Next.js, `unsafe-inline` для Tailwind CSS.

---

## ⚡ Производительность и кэширование

### Стратегия кэширования

#### Development (DEBUG=True)
- **Backend:** LocMemCache (в памяти процесса)
- **Быстрый старт:** не требует Redis

#### Production (DEBUG=False)
- **Backend:** Redis (3 отдельные БД)
- **Версионирование:** CACHE_VERSION для инвалидации
- **Connection Pooling:** 50 подключений
- **Retry on Timeout:** включён

### Настройки таймаутов

```python
default: 300s (5 минут)      # Общие данные
long_term: 1800s (30 минут)  # Магазины, категории
stats: 600s (10 минут)        # Статистика
```

### Инвалидация кэша

**Глобальная инвалидация:**
```bash
# Увеличьте CACHE_VERSION в .env
CACHE_VERSION=2
```

**Частичная инвалидация:**
```python
from django.core.cache import cache
cache.delete_pattern('boltpromo_stats:*')
```

---

## 🧪 Тестирование

### Backend Tests

**Покрытие:**
- ✅ API трекинга событий (view, copy, open, finance, deal)
- ✅ Агрегация событий (hourly, daily)
- ✅ API статистики (топ промокоды, магазины, кэширование)
- ✅ SiteAssets API (favicon, OG images, метаданные)
- ✅ Модели (PromoCode, Store, Category, Showcase)

**Запуск тестов:**
```bash
cd backend
python manage.py test core
```

**Ожидаемый результат:**
```
Ran 12 tests in 2.5s
OK
```

### Frontend Tests (Рекомендуется)

**TODO: Добавить smoke tests для:**
- Рендеринг ключевых страниц (/, /hot, /stores, /categories)
- Копирование промокода и редирект
- Пустые состояния (нет промокодов)

**Пример команды:**
```bash
cd frontend
npm run test
```

---

## ⚙️ Конфигурация окружения

### Backend (.env)

Скопируйте `backend/.env.example` в `backend/.env` и заполните:

```bash
# Django Core
DEBUG=False
SECRET_KEY=your-super-secret-key-generate-with-python-secrets
ALLOWED_HOSTS=boltpromo.ru,www.boltpromo.ru

# PostgreSQL
DB_NAME=boltpromo
DB_USER=postgres
DB_PASSWORD=your-secure-database-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Cache Version (для инвалидации)
CACHE_VERSION=1

# Sentry (опционально)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Email
EMAIL_HOST=smtp.yandex.ru
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=support@boltpromo.ru
```

### Генерация SECRET_KEY

```python
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://boltpromo.ru/api/v1
NEXT_PUBLIC_SITE_URL=https://boltpromo.ru
```

---

## 🚀 Инструкция по деплою

### 1. Подготовка сервера

#### Системные требования
- **OS:** Ubuntu 22.04 LTS или аналог
- **Python:** 3.11+
- **Node.js:** 18+ (для фронтенда)
- **PostgreSQL:** 14+
- **Redis:** 7+
- **RAM:** минимум 2GB (рекомендуется 4GB+)
- **Disk:** минимум 20GB SSD

#### Установка зависимостей

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Redis
sudo apt install redis-server -y

# Python и virtualenv
sudo apt install python3.11 python3.11-venv python3-pip -y

# Node.js (через nvm или apt)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Nginx
sudo apt install nginx -y
```

### 2. Настройка базы данных

```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# Создание БД и пользователя
CREATE DATABASE boltpromo;
CREATE USER boltpromo_user WITH PASSWORD 'your-secure-password';
ALTER ROLE boltpromo_user SET client_encoding TO 'utf8';
ALTER ROLE boltpromo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE boltpromo_user SET timezone TO 'Europe/Moscow';
GRANT ALL PRIVILEGES ON DATABASE boltpromo TO boltpromo_user;
\q
```

### 3. Деплой Backend

```bash
# Клонирование репозитория
git clone https://github.com/your-org/BoltPromo.git /var/www/boltpromo
cd /var/www/boltpromo/backend

# Создание виртуального окружения
python3.11 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install --upgrade pip
pip install -r requirements.txt

# Настройка .env
cp .env.example .env
nano .env  # Заполните все переменные

# Миграции
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Сбор статики
python manage.py collectstatic --noinput

# Проверка конфигурации
python manage.py check --deploy
```

### 4. Деплой Frontend

```bash
cd /var/www/boltpromo/frontend

# Установка зависимостей
npm install

# Настройка .env
cp .env.example .env.local
nano .env.local

# Сборка production build
npm run build

# Проверка сборки
npm run start  # Временный запуск для проверки
```

### 5. Настройка Systemd сервисов

#### Backend (Gunicorn)

Создайте `/etc/systemd/system/boltpromo-backend.service`:

```ini
[Unit]
Description=BoltPromo Backend (Gunicorn)
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/boltpromo/backend
Environment="PATH=/var/www/boltpromo/backend/venv/bin"
ExecStart=/var/www/boltpromo/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/boltpromo-backend.sock \
    --timeout 120 \
    --access-logfile /var/log/boltpromo/access.log \
    --error-logfile /var/log/boltpromo/error.log \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### Frontend (Next.js)

Создайте `/etc/systemd/system/boltpromo-frontend.service`:

```ini
[Unit]
Description=BoltPromo Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/boltpromo/frontend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run start

[Install]
WantedBy=multi-user.target
```

#### Celery Worker

Создайте `/etc/systemd/system/boltpromo-celery.service`:

```ini
[Unit]
Description=BoltPromo Celery Worker
After=network.target redis.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/boltpromo/backend
Environment="PATH=/var/www/boltpromo/backend/venv/bin"
ExecStart=/var/www/boltpromo/backend/venv/bin/celery -A config worker \
    --loglevel=info \
    --logfile=/var/log/boltpromo/celery.log

[Install]
WantedBy=multi-user.target
```

#### Celery Beat

Создайте `/etc/systemd/system/boltpromo-celerybeat.service`:

```ini
[Unit]
Description=BoltPromo Celery Beat Scheduler
After=network.target redis.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/boltpromo/backend
Environment="PATH=/var/www/boltpromo/backend/venv/bin"
ExecStart=/var/www/boltpromo/backend/venv/bin/celery -A config beat \
    --loglevel=info \
    --logfile=/var/log/boltpromo/celerybeat.log \
    --pidfile=/var/run/celerybeat.pid

[Install]
WantedBy=multi-user.target
```

#### Запуск сервисов

```bash
# Создание директории для логов
sudo mkdir -p /var/log/boltpromo
sudo chown www-data:www-data /var/log/boltpromo

# Перезагрузка systemd
sudo systemctl daemon-reload

# Запуск сервисов
sudo systemctl start boltpromo-backend
sudo systemctl start boltpromo-frontend
sudo systemctl start boltpromo-celery
sudo systemctl start boltpromo-celerybeat

# Автозапуск
sudo systemctl enable boltpromo-backend
sudo systemctl enable boltpromo-frontend
sudo systemctl enable boltpromo-celery
sudo systemctl enable boltpromo-celerybeat

# Проверка статуса
sudo systemctl status boltpromo-backend
sudo systemctl status boltpromo-frontend
sudo systemctl status boltpromo-celery
sudo systemctl status boltpromo-celerybeat
```

### 6. Настройка Nginx

Создайте `/etc/nginx/sites-available/boltpromo`:

```nginx
# Редирект www -> non-www
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.boltpromo.ru;

    ssl_certificate /etc/letsencrypt/live/boltpromo.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boltpromo.ru/privkey.pem;

    return 301 https://boltpromo.ru$request_uri;
}

# Основной сервер
server {
    listen 80;
    server_name boltpromo.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name boltpromo.ru;

    # SSL сертификаты (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/boltpromo.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/boltpromo.ru/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Современные SSL протоколы
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;

    # Логи
    access_log /var/log/nginx/boltpromo_access.log;
    error_log /var/log/nginx/boltpromo_error.log;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://unix:/run/boltpromo-backend.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://unix:/run/boltpromo-backend.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы Django
    location /static/ {
        alias /var/www/boltpromo/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media файлы Django
    location /media/ {
        alias /var/www/boltpromo/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # robots.txt
    location = /robots.txt {
        alias /var/www/boltpromo/frontend/public/robots.txt;
    }

    # sitemap.xml
    location = /sitemap.xml {
        alias /var/www/boltpromo/frontend/public/sitemap.xml;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/boltpromo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL сертификат (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d boltpromo.ru -d www.boltpromo.ru

# Автообновление
sudo certbot renew --dry-run
```

---

## 💾 Бэкапы и восстановление

### Автоматические бэкапы

#### Скрипт бэкапа PostgreSQL

Создайте `/usr/local/bin/backup-boltpromo-db.sh`:

```bash
#!/bin/bash

# Конфигурация
DB_NAME="boltpromo"
DB_USER="boltpromo_user"
BACKUP_DIR="/var/backups/boltpromo/db"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# Создание директории
mkdir -p $BACKUP_DIR

# Бэкап базы данных
pg_dump -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Удаление старых бэкапов
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Database backup completed: db_$DATE.sql.gz"
```

Сделайте скрипт исполняемым:

```bash
sudo chmod +x /usr/local/bin/backup-boltpromo-db.sh
```

#### Скрипт бэкапа Media файлов

Создайте `/usr/local/bin/backup-boltpromo-media.sh`:

```bash
#!/bin/bash

# Конфигурация
MEDIA_DIR="/var/www/boltpromo/backend/media"
BACKUP_DIR="/var/backups/boltpromo/media"
DATE=$(date +"%Y%m%d")
RETENTION_DAYS=60

# Создание директории
mkdir -p $BACKUP_DIR

# Бэкап media файлов
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /var/www/boltpromo/backend media/

# Удаление старых бэкапов
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Media backup completed: media_$DATE.tar.gz"
```

Сделайте скрипт исполняемым:

```bash
sudo chmod +x /usr/local/bin/backup-boltpromo-media.sh
```

#### Настройка Cron

Откройте crontab:

```bash
sudo crontab -e
```

Добавьте задачи:

```cron
# БД ежедневно в 02:00
0 2 * * * /usr/local/bin/backup-boltpromo-db.sh >> /var/log/boltpromo/backup.log 2>&1

# Media еженедельно (воскресенье в 03:00)
0 3 * * 0 /usr/local/bin/backup-boltpromo-media.sh >> /var/log/boltpromo/backup.log 2>&1
```

### Восстановление из бэкапа

#### Восстановление БД

```bash
# Список доступных бэкапов
ls -lh /var/backups/boltpromo/db/

# Восстановление из конкретного бэкапа
gunzip < /var/backups/boltpromo/db/db_20251003_020000.sql.gz | psql -U boltpromo_user -d boltpromo
```

#### Восстановление Media

```bash
# Восстановление media файлов
cd /var/www/boltpromo/backend
tar -xzf /var/backups/boltpromo/media/media_20251003.tar.gz
```

### Облачные бэкапы (Рекомендуется)

**Для критичных данных рекомендуется дублировать бэкапы в облако:**

- AWS S3
- Yandex Cloud Storage
- Google Cloud Storage

**Пример синхронизации в S3:**

```bash
# Установка AWS CLI
sudo apt install awscli -y

# Настройка
aws configure

# Синхронизация бэкапов
aws s3 sync /var/backups/boltpromo/ s3://your-bucket/boltpromo-backups/
```

---

## ✅ Чек-лист перед запуском

### Backend

- [ ] Все переменные окружения заполнены в `.env`
- [ ] `DEBUG=False` в production
- [ ] `SECRET_KEY` сгенерирован и уникален
- [ ] `ALLOWED_HOSTS` содержит все домены
- [ ] PostgreSQL база данных создана
- [ ] Redis запущен и доступен
- [ ] Миграции применены: `python manage.py migrate`
- [ ] Суперпользователь создан: `python manage.py createsuperuser`
- [ ] Статика собрана: `python manage.py collectstatic`
- [ ] `python manage.py check --deploy` выполнен без ошибок
- [ ] Gunicorn запущен и работает
- [ ] Celery worker и beat запущены
- [ ] Админка доступна по `/admin/`

### Frontend

- [ ] `.env.local` настроен с правильным API URL
- [ ] Production build создан: `npm run build`
- [ ] Next.js сервер запущен
- [ ] Сайт отвечает на `https://boltpromo.ru`
- [ ] Cookie consent баннер отображается
- [ ] SEO метаданные генерируются корректно

### Инфраструктура

- [ ] Nginx настроен и запущен
- [ ] SSL сертификат установлен (Let's Encrypt)
- [ ] Редирект HTTP → HTTPS работает
- [ ] Редирект www → non-www работает
- [ ] HSTS заголовок установлен
- [ ] Security headers присутствуют (CSP, X-Frame-Options и т.д.)
- [ ] Статические файлы отдаются корректно
- [ ] Media файлы доступны
- [ ] Логи пишутся в `/var/log/boltpromo/`

### Безопасность

- [ ] Firewall настроен (только 80, 443, 22 порты)
- [ ] SSH доступ только по ключу
- [ ] PostgreSQL слушает только localhost
- [ ] Redis защищён паролем (если внешний доступ)
- [ ] Sentry настроен для мониторинга ошибок (опционально)
- [ ] Бэкапы БД и media настроены

### Производительность

- [ ] Кэширование работает (проверьте Redis)
- [ ] Lighthouse Score ≥ 90 (Performance, SEO, Accessibility)
- [ ] Gzip/Brotli сжатие включено
- [ ] Изображения оптимизированы
- [ ] CDN настроен (опционально)

### Мониторинг

- [ ] Логи доступны и читаемы
- [ ] Uptime мониторинг настроен (UptimeRobot, Pingdom и т.д.)
- [ ] Метрики собираются (Prometheus/Grafana опционально)
- [ ] Alerts настроены для критичных событий

---

## 📊 Мониторинг и обслуживание

### Проверка статуса сервисов

```bash
# Все сервисы
sudo systemctl status boltpromo-*

# Логи
sudo journalctl -u boltpromo-backend -f
sudo journalctl -u boltpromo-frontend -f
sudo journalctl -u boltpromo-celery -f
```

### Мониторинг производительности

```bash
# Использование ресурсов
htop

# Дисковое пространство
df -h

# PostgreSQL запросы
sudo -u postgres psql -d boltpromo -c "SELECT * FROM pg_stat_activity;"

# Redis мониторинг
redis-cli INFO stats
```

### Обновление проекта

```bash
# Backend
cd /var/www/boltpromo/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart boltpromo-backend
sudo systemctl restart boltpromo-celery
sudo systemctl restart boltpromo-celerybeat

# Frontend
cd /var/www/boltpromo/frontend
git pull origin main
npm install
npm run build
sudo systemctl restart boltpromo-frontend
```

### Очистка и обслуживание

```bash
# Очистка старых событий (>30 дней)
cd /var/www/boltpromo/backend
source venv/bin/activate
python manage.py shell -c "from core.tasks import cleanup_old_events; cleanup_old_events(30)"

# Очистка кэша
redis-cli FLUSHDB

# Очистка сессий Django
python manage.py clearsessions

# Ротация логов
sudo logrotate -f /etc/logrotate.d/boltpromo
```

### Мониторинг Lighthouse Score

```bash
# Установка Lighthouse CI
npm install -g @lhci/cli

# Запуск аудита
lhci autorun --config=.lighthouserc.json
```

---

## 🎯 Рекомендации после деплоя

### Критичные

1. **Настройте мониторинг uptime** (UptimeRobot, Pingdom)
2. **Проверьте бэкапы** (запустите тестовое восстановление)
3. **Настройте Sentry** для отслеживания ошибок
4. **Проверьте Lighthouse Score** (должен быть ≥ 90)
5. **Протестируйте все основные сценарии:**
   - Просмотр промокода
   - Копирование кода
   - Переход по партнёрской ссылке
   - Поиск
   - Фильтрация
   - Витрины

### Желательные

1. **Настройте CDN** для static/media файлов (CloudFlare, AWS CloudFront)
2. **Добавьте smoke tests** для фронтенда
3. **Настройте CI/CD pipeline** (GitHub Actions, GitLab CI)
4. **Настройте метрики** (Prometheus + Grafana)
5. **Добавьте A/B тестирование** (опционально)

### SEO

1. **Зарегистрируйте сайт:**
   - Google Search Console
   - Yandex Webmaster
2. **Отправьте sitemap:**
   - `https://boltpromo.ru/sitemap.xml`
3. **Проверьте robots.txt**
4. **Настройте structured data** (Schema.org)
5. **Мониторьте индексацию** и позиции

---

## 📞 Поддержка и контакты

**Документация:**
- Backend API: `https://boltpromo.ru/api/docs/`
- Django Admin: `https://boltpromo.ru/admin/`

**Техническая поддержка:**
- Email: support@boltpromo.ru
- Telegram: @BoltPromoBot

**Для разработчиков:**
- GitHub: https://github.com/your-org/BoltPromo
- Документация: https://github.com/your-org/BoltPromo/wiki

---

## 📄 Changelog

### v1.0.0 (03.10.2025)

#### Добавлено
- ✅ CSP и security headers
- ✅ HSTS и secure cookies
- ✅ Cookie consent баннер
- ✅ Redis кэширование с версионированными ключами
- ✅ Backend unit tests (12 test cases)
- ✅ Обновлённый .env.example с документацией
- ✅ Улучшенная политика конфиденциальности

#### Исправлено
- Конфигурация кэша для production (Redis)
- Внешние ссылки теперь имеют правильные rel атрибуты

#### Безопасность
- Все заголовки безопасности реализованы
- HSTS включён для production
- Cookies защищены (secure, httponly, samesite)

---

**🚀 Проект готов к production деплою!**

Следуйте инструкциям выше, выполните чек-лист, и ваш сайт будет готов к запуску. Удачи! 🎉
