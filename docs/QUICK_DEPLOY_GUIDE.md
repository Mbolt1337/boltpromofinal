# Quick Deploy Guide - BoltPromo

## КРИТИЧЕСКИЕ ДЕЙСТВИЯ ПЕРЕД ДЕПЛОЕМ

### 1. Environment Variables (ОБЯЗАТЕЛЬНО)

**Backend (`backend/.env`):**
```bash
# Безопасность
DEBUG=False
SECRET_KEY=<сгенерировать через python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'>
ALLOWED_HOSTS=ваш-домен.ru,www.ваш-домен.ru

# База данных
DB_NAME=boltpromo_prod
DB_USER=boltpromo_user
DB_PASSWORD=<сильный пароль>
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Email (опционально для уведомлений)
EMAIL_HOST=smtp.yandex.ru
EMAIL_PORT=587
EMAIL_HOST_USER=ваш-email@example.com
EMAIL_HOST_PASSWORD=<пароль от email>
DEFAULT_FROM_EMAIL=noreply@ваш-домен.ru

# Отключить dev-инструменты
ENABLE_SILK=False
```

**Frontend (`frontend/.env.production`):**
```bash
NEXT_PUBLIC_API_URL=https://api.ваш-домен.ru
NEXT_PUBLIC_SITE_URL=https://ваш-домен.ru
```

### 2. Django Settings Проверка

Убедитесь в `config/settings.py`:
- ✅ `DEBUG = False` (без fallback!)
- ✅ `ALLOWED_HOSTS` из env
- ✅ `SECURE_SSL_REDIRECT = True`
- ✅ `SECURE_HSTS_SECONDS = 31536000`
- ✅ `SESSION_COOKIE_SECURE = True`
- ✅ `CSRF_COOKIE_SECURE = True`
- ✅ Silk middleware убран или за `if DEBUG`

### 3. Deployment Script (создать /ops)

**`/ops/deploy.sh`:**
```bash
#!/bin/bash
set -e

echo "=== BoltPromo Deploy Script ==="

# 1. Backup database
pg_dump boltpromo_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull latest code
git pull origin main

# 3. Backend
cd backend
python -m pip install -r requirements.txt
python manage.py migrate --no-input
python manage.py collectstatic --no-input
sudo systemctl restart gunicorn
sudo systemctl restart celery
sudo systemctl restart celerybeat

# 4. Frontend
cd ../frontend
npm install
npm run build
pm2 restart nextjs || pm2 start npm --name "nextjs" -- start

echo "=== Deploy Complete ==="
```

### 4. Systemd Services (создать /deploy/systemd)

**`/deploy/systemd/gunicorn.service`:**
```ini
[Unit]
Description=BoltPromo Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/boltpromo/backend
Environment="PATH=/var/www/boltpromo/venv/bin"
ExecStart=/var/www/boltpromo/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/gunicorn.sock \
    --timeout 60 \
    --access-logfile /var/log/boltpromo/gunicorn-access.log \
    --error-logfile /var/log/boltpromo/gunicorn-error.log \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

**`/deploy/systemd/celery.service`:**
```ini
[Unit]
Description=BoltPromo Celery Worker
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/boltpromo/backend
Environment="PATH=/var/www/boltpromo/venv/bin"
ExecStart=/var/www/boltpromo/venv/bin/celery -A config worker \
    --loglevel=info \
    --logfile=/var/log/boltpromo/celery.log \
    --pidfile=/var/run/celery.pid

[Install]
WantedBy=multi-user.target
```

### 5. Nginx Config (создать /deploy/nginx)

**`/deploy/nginx/boltpromo.conf`:**
```nginx
upstream backend_api {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;
    return 301 https://$host$request_uri;
}

# HTTPS Backend API
server {
    listen 443 ssl http2;
    server_name api.ваш-домен.ru;

    ssl_certificate /etc/letsencrypt/live/api.ваш-домен.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ваш-домен.ru/privkey.pem;

    client_max_body_size 10M;

    location /static/ {
        alias /var/www/boltpromo/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/boltpromo/backend/media/;
        expires 7d;
    }

    location / {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTPS Frontend
server {
    listen 443 ssl http2;
    server_name ваш-домен.ru www.ваш-домен.ru;

    ssl_certificate /etc/letsencrypt/live/ваш-домен.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.ru/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Финальные Команды на Сервере

```bash
# Создать директории
sudo mkdir -p /var/www/boltpromo
sudo mkdir -p /var/log/boltpromo

# Клонировать репозиторий
cd /var/www/boltpromo
git clone <ваш-репозиторий> .

# Backend setup
cd backend
python3 -m venv /var/www/boltpromo/venv
source /var/www/boltpromo/venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Создать .env
cp .env.example .env
nano .env  # заполнить все переменные

# Миграции
python manage.py migrate
python manage.py collectstatic --no-input
python manage.py createsuperuser

# Frontend setup
cd ../frontend
npm install
npm run build

# Установить сервисы
sudo cp /var/www/boltpromo/deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gunicorn celery celerybeat
sudo systemctl start gunicorn celery celerybeat

# Nginx
sudo cp /var/www/boltpromo/deploy/nginx/boltpromo.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/boltpromo.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL (Let's Encrypt)
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru -d api.ваш-домен.ru
```

### 7. Post-Deploy Checklist

- [ ] `python manage.py check --deploy` - без ошибок
- [ ] Проверить `/admin` - доступен и работает
- [ ] Проверить `/api/v1/` - возвращает данные
- [ ] Проверить главную страницу - загружается корректно
- [ ] `systemctl status gunicorn celery celerybeat` - все active
- [ ] Проверить логи: `tail -f /var/log/boltpromo/*.log`
- [ ] SSL сертификаты установлены (A+ на ssllabs.com)
- [ ] Redis доступен: `redis-cli ping`
- [ ] PostgreSQL работает: `psql -U boltpromo_user -d boltpromo_prod -c "SELECT 1;"`

### 8. Monitoring & Maintenance

**Логи:**
```bash
# Django/Gunicorn
tail -f /var/log/boltpromo/gunicorn-error.log

# Celery
tail -f /var/log/boltpromo/celery.log

# Nginx
tail -f /var/log/nginx/error.log
```

**Backup Script (`/ops/backup.sh`):**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/boltpromo"
DATE=$(date +%Y%m%d_%H%M%S)

# Database
pg_dump -U boltpromo_user boltpromo_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/boltpromo/backend/media/

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

**Cron для бэкапов:**
```bash
# Ежедневно в 3:00
0 3 * * * /var/www/boltpromo/ops/backup.sh
```

---

## КРИТИЧЕСКИЕ ОШИБКИ, КОТОРЫЕ НУЖНО ИЗБЕЖАТЬ

1. ❌ **НЕ коммитьте .env файлы с секретами в git**
2. ❌ **НЕ оставляйте DEBUG=True в продакшене**
3. ❌ **НЕ используйте SQLite в продакшене**
4. ❌ **НЕ забудьте настроить ALLOWED_HOSTS**
5. ❌ **НЕ запускайте без SSL сертификатов**
6. ❌ **НЕ забудьте запустить collectstatic**
7. ❌ **НЕ забудьте про миграции БД**
8. ❌ **НЕ оставляйте дефолтный SECRET_KEY**

---

**Создано:** 2025-01-10
**Для:** BoltPromo Production Deployment
**Контакт:** См. README.md
