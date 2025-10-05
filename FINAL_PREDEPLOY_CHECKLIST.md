# 🚀 FINAL PRE-DEPLOY CHECKLIST - BoltPromo

Финальный чеклист перед деплоем в production. Следуйте по порядку.

---

## 📋 Оглавление

1. [Предварительные проверки](#1-предварительные-проверки)
2. [Backend проверки](#2-backend-проверки)
3. [Frontend проверки](#3-frontend-проверки)
4. [Безопасность](#4-безопасность)
5. [Production конфигурация](#5-production-конфигурация)
6. [Тестирование](#6-тестирование)
7. [Резервное копирование](#7-резервное-копирование)
8. [Deploy команды](#8-deploy-команды)
9. [Post-deploy проверки](#9-post-deploy-проверки)
10. [Rollback план](#10-rollback-план)

---

## 1. Предварительные проверки

### ✅ Git и код

- [ ] Все изменения закоммичены
- [ ] Ветка синхронизирована с main/master
- [ ] Нет незакоммиченных изменений (`git status` чистый)
- [ ] Все конфликты слияния разрешены
- [ ] Changelog обновлен (если есть)

```bash
git status
git log --oneline -5
```

### ✅ Зависимости

- [ ] `backend/requirements.txt` актуален
- [ ] `frontend/package.json` актуален
- [ ] Нет уязвимостей в зависимостях

```bash
# Backend
pip check

# Frontend
cd frontend && npm audit
```

---

## 2. Backend проверки

### ✅ Django настройки

- [ ] `DEBUG = False` в production settings
- [ ] `ALLOWED_HOSTS` настроен корректно
- [ ] `SECRET_KEY` уникальный и безопасный (не дефолтный!)
- [ ] `CSRF_TRUSTED_ORIGINS` настроен
- [ ] `CORS_ALLOWED_ORIGINS` настроен

```bash
# Проверить settings
cd backend
python manage.py check --deploy
```

### ✅ База данных

- [ ] Миграции применены
- [ ] Нет несозданных миграций
- [ ] Индексы созданы (см. 0014_add_popular_ordering_indexes.py)

```bash
cd backend
python manage.py showmigrations
python manage.py makemigrations --check --dry-run
```

### ✅ Static/Media файлы

- [ ] `python manage.py collectstatic` выполнен
- [ ] Медиафайлы доступны (если есть)
- [ ] Nginx/CDN настроен для статики

```bash
cd backend
python manage.py collectstatic --noinput
```

### ✅ Celery и Redis

- [ ] Redis запущен и доступен
- [ ] Celery worker запускается
- [ ] Celery beat настроен для периодических задач
- [ ] Задачи `aggregate_events_daily` и `update_auto_hot_promos` работают

```bash
# Проверить Redis
redis-cli ping

# Проверить Celery
cd backend
celery -A config inspect ping
```

---

## 3. Frontend проверки

### ✅ Next.js сборка

- [ ] Production build успешен (`npm run build`)
- [ ] Нет критических warnings в build output
- [ ] Bundle size приемлем (<500KB First Load JS)

```bash
cd frontend
npm run build
```

### ✅ Environment переменные

- [ ] `.env.production` настроен
- [ ] `NEXT_PUBLIC_API_URL` указывает на production API
- [ ] Все `NEXT_PUBLIC_*` переменные корректны

```bash
cat frontend/.env.production
```

### ✅ SEO и метаданные

- [ ] Все страницы имеют `generateMetadata()`
- [ ] JSON-LD схемы добавлены (WebSite, Organization, ItemList, Product)
- [ ] Canonical URLs настроены
- [ ] Open Graph теги настроены
- [ ] robots.txt и sitemap.xml доступны

```bash
curl http://localhost:3000/robots.txt
curl http://localhost:3000/sitemap.xml
```

---

## 4. Безопасность

### ✅ CSP и Security Headers

- [ ] CSP middleware активирован
- [ ] HSTS настроен (`SECURE_HSTS_SECONDS = 31536000`)
- [ ] Secure cookies включены (`SESSION_COOKIE_SECURE = True`)
- [ ] XSS protection включен
- [ ] Clickjacking protection включен

```bash
# Проверить headers
curl -I http://localhost:8000/api/v1/health/ | grep -E "Content-Security-Policy|Strict-Transport-Security"
```

### ✅ Секреты и ключи

- [ ] Все секреты в `.env` файле (не в коде!)
- [ ] `.env` добавлен в `.gitignore`
- [ ] Production `.env` НЕ в Git
- [ ] API ключи ротированы (если нужно)

```bash
# Убедиться что .env не в Git
git ls-files | grep .env
# Должно быть пусто (кроме .env.example)
```

---

## 5. Production конфигурация

### ✅ Nginx

- [ ] Nginx конфиг настроен для Django static/media
- [ ] Nginx проксирует API на `localhost:8000`
- [ ] Nginx проксирует Frontend на `localhost:3000`
- [ ] SSL сертификат установлен (Let's Encrypt или другой)
- [ ] Редирект HTTP → HTTPS настроен

```nginx
# Пример конфига
server {
    listen 80;
    server_name boltpromo.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name boltpromo.ru;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### ✅ Systemd сервисы (или PM2)

- [ ] Gunicorn service настроен
- [ ] Celery worker service настроен
- [ ] Celery beat service настроен
- [ ] Next.js service настроен (или PM2)
- [ ] Все сервисы включены для автозапуска

```bash
# Systemd
sudo systemctl enable gunicorn
sudo systemctl enable celery-worker
sudo systemctl enable celery-beat

# PM2
pm2 startup
pm2 save
```

---

## 6. Тестирование

### ✅ Unit Tests (Backend)

- [ ] Все backend тесты проходят
- [ ] Coverage > 70% (если настроен)

```bash
cd backend
python manage.py test core.tests
```

### ✅ Smoke Tests

- [ ] Smoke tests проходят успешно

```bash
python backend/test_smoke.py
```

### ✅ Lighthouse Audit

- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90

```bash
cd frontend
npm run lighthouse
```

### ✅ Ручное тестирование

- [ ] Главная страница загружается
- [ ] Список промокодов работает
- [ ] Страница магазина работает
- [ ] Поиск работает
- [ ] Фильтры работают
- [ ] Переход на промокод работает (event tracking)
- [ ] Карусели анимируются корректно
- [ ] Мобильная версия работает (320px - 768px)

---

## 7. Резервное копирование

### ✅ Backup перед деплоем

- [ ] Создан бэкап БД

```bash
./ops/backup_db.sh
```

- [ ] Бэкап сохранен в безопасном месте (вне сервера!)
- [ ] Проверена возможность восстановления

```bash
# Список бэкапов
ls -lh ./backups/

# Тестовое восстановление (опционально, на staging)
./ops/restore_db.sh ./backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 8. Deploy команды

### 🔧 Последовательность деплоя

**Шаг 1: Обновить код**

```bash
git pull origin main
```

**Шаг 2: Backend деплой**

```bash
cd backend

# Установить зависимости
pip install -r requirements.txt

# Применить миграции
python manage.py migrate

# Собрать статику
python manage.py collectstatic --noinput

# Перезапустить сервисы
cd ..
./ops/restart_services.sh restart
```

**Шаг 3: Frontend деплой**

```bash
cd frontend

# Установить зависимости
npm ci

# Собрать production build
npm run build

# Перезапустить Next.js
pm2 restart boltpromo-frontend
# Или через systemd:
# sudo systemctl restart nextjs
```

**Шаг 4: Nginx**

```bash
# Проверить конфиг
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
```

**Шаг 5: Очистить кэш**

```bash
./ops/clear_cache.sh
# Ответить "yes" для очистки кэша
```

---

## 9. Post-deploy проверки

### ✅ Сервисы

- [ ] Все сервисы запущены

```bash
./ops/restart_services.sh status
```

### ✅ API

- [ ] Health check возвращает 200

```bash
curl https://boltpromo.ru/api/v1/health/
```

- [ ] Smoke tests проходят

```bash
API_BASE_URL=https://boltpromo.ru/api/v1 python backend/test_smoke.py
```

### ✅ Frontend

- [ ] Главная страница доступна
- [ ] Нет JS ошибок в консоли (проверить DevTools)
- [ ] SEO теги корректны (проверить View Source)

```bash
curl -I https://boltpromo.ru/
```

### ✅ Мониторинг

- [ ] Логи проверены на ошибки

```bash
# Django
tail -n 50 logs/gunicorn_error.log

# Celery
tail -n 50 logs/celery_worker.log

# Nginx
sudo tail -n 50 /var/log/nginx/error.log
```

- [ ] Metrika/Analytics работает (если настроен)
- [ ] Sentry/Error tracking работает (если настроен)

---

## 10. Rollback план

### 🔙 Если что-то пошло не так

**Вариант 1: Откатить код**

```bash
# Вернуться на предыдущий commit
git revert HEAD
git push origin main

# Или вернуться на конкретный commit
git reset --hard <commit_hash>
git push origin main --force  # ОСТОРОЖНО!

# Передеплоить
./ops/restart_services.sh restart
```

**Вариант 2: Восстановить БД**

```bash
# Остановить сервисы
./ops/restart_services.sh stop

# Восстановить из бэкапа
./ops/restore_db.sh ./backups/db_backup_YYYYMMDD_HHMMSS.sql.gz

# Запустить сервисы
./ops/restart_services.sh start
```

**Вариант 3: Быстрый rollback через PM2/Systemd**

```bash
# PM2 (Next.js)
pm2 stop boltpromo-frontend

# Systemd (Gunicorn)
sudo systemctl stop gunicorn

# Вернуть предыдущую версию, затем запустить снова
```

---

## 📊 Чеклист summary

Перед деплоем убедитесь, что:

- ✅ **Git**: Все изменения закоммичены
- ✅ **Backend**: Миграции, статика, тесты OK
- ✅ **Frontend**: Build успешен, Lighthouse ≥90
- ✅ **Security**: CSP, HSTS, secure cookies
- ✅ **Config**: Nginx, systemd/PM2 настроены
- ✅ **Tests**: Unit tests + Smoke tests проходят
- ✅ **Backup**: БД забэкаплена
- ✅ **Deploy**: Команды выполнены последовательно
- ✅ **Post-check**: Сервисы работают, логи чистые
- ✅ **Rollback**: План отката подготовлен

---

## 🎉 Deploy готов!

Если все пункты чеклиста пройдены — можете смело деплоить в production!

**Полезные команды после деплоя:**

```bash
# Мониторинг логов в реальном времени
tail -f logs/gunicorn_error.log
tail -f logs/celery_worker.log

# Статус всех сервисов
./ops/restart_services.sh status

# Smoke tests
python backend/test_smoke.py

# Создать бэкап после деплоя
./ops/backup_db.sh
```

**Документация:**
- [ops/README.md](ops/README.md) - Операционные скрипты
- [PREDEPLOY_UI_SEO_REPORT_V2.md](PREDEPLOY_UI_SEO_REPORT_V2.md) - UI/SEO аудит
- [backend/test_smoke.py](backend/test_smoke.py) - Smoke tests

---

**Good luck with the deployment! 🚀**
