# Deploy Configuration Files

Этот каталог содержит конфигурационные файлы для production deployment BoltPromo.

## Содержимое

### `/systemd` - Systemd Service Files

Конфигурации для автоматического запуска сервисов:

- **`gunicorn.service`** - Django WSGI server
- **`celery.service`** - Celery worker для асинхронных задач
- **`celerybeat.service`** - Celery beat scheduler для периодических задач

### `/nginx` - Nginx Configuration

Конфигурация веб-сервера:

- **`boltpromo.conf`** - Полная конфигурация nginx для frontend и backend

## Установка

### 1. Systemd Services

```bash
# Копировать service файлы
sudo cp systemd/*.service /etc/systemd/system/

# Перезагрузить systemd
sudo systemctl daemon-reload

# Включить автозапуск
sudo systemctl enable gunicorn celery celerybeat

# Запустить сервисы
sudo systemctl start gunicorn
sudo systemctl start celery
sudo systemctl start celerybeat

# Проверить статус
sudo systemctl status gunicorn
sudo systemctl status celery
sudo systemctl status celerybeat
```

### 2. Nginx Configuration

```bash
# Копировать конфигурацию
sudo cp nginx/boltpromo.conf /etc/nginx/sites-available/

# Создать symlink
sudo ln -s /etc/nginx/sites-available/boltpromo.conf /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить nginx
sudo systemctl reload nginx
```

### 3. SSL Certificates (Let's Encrypt)

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx

# Получить сертификаты
sudo certbot --nginx -d yourdomain.ru -d www.yourdomain.ru -d api.yourdomain.ru

# Проверить автоматическое обновление
sudo certbot renew --dry-run
```

## Важные замечания

### Перед установкой

1. **Замените `yourdomain.ru`** на ваш реальный домен во всех файлах
2. **Замените пути** если ваш проект не в `/var/www/boltpromo`
3. **Замените пользователя** если не используете `www-data`
4. **Создайте директории для логов**:
   ```bash
   sudo mkdir -p /var/log/boltpromo
   sudo chown www-data:www-data /var/log/boltpromo
   ```
5. **Создайте директории для runtime**:
   ```bash
   sudo mkdir -p /var/run/celery
   sudo chown www-data:www-data /var/run/celery
   ```

### Systemd Services

**Переменные окружения:**
- Все сервисы читают `.env` файл из `EnvironmentFile`
- Убедитесь что `.env` существует и содержит все необходимые переменные

**Логи:**
```bash
# Gunicorn
journalctl -u gunicorn -f
tail -f /var/log/boltpromo/gunicorn-error.log

# Celery
journalctl -u celery -f
tail -f /var/log/boltpromo/celery.log

# Celery Beat
journalctl -u celerybeat -f
tail -f /var/log/boltpromo/celerybeat.log
```

**Управление:**
```bash
# Перезапуск
sudo systemctl restart gunicorn
sudo systemctl restart celery
sudo systemctl restart celerybeat

# Остановка
sudo systemctl stop gunicorn

# Автозагрузка (отключить)
sudo systemctl disable gunicorn
```

### Nginx Configuration

**Важные настройки:**

1. **Rate Limiting:**
   - API endpoints: 30 req/s + burst 50
   - Admin panel: 10 req/s + burst 10
   - Настройте под вашу нагрузку

2. **SSL Configuration:**
   - Используется TLS 1.2 и 1.3
   - HSTS включен (31536000 секунд = 1 год)
   - OCSP stapling включен

3. **Caching:**
   - Static files: 30 дней
   - Media files: 7 дней
   - Next.js \_next/static: 365 дней

4. **Security Headers:**
   - CSP обрабатывается Django middleware
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff

**Файлы логов:**
```bash
# Frontend
tail -f /var/log/nginx/boltpromo-frontend-access.log
tail -f /var/log/nginx/boltpromo-frontend-error.log

# Backend API
tail -f /var/log/nginx/boltpromo-api-access.log
tail -f /var/log/nginx/boltpromo-api-error.log
```

## Troubleshooting

### Gunicorn не запускается

```bash
# Проверить логи
journalctl -u gunicorn -n 50

# Проверить .env файл
ls -la /var/www/boltpromo/backend/.env

# Проверить права
ls -la /var/www/boltpromo/backend/

# Попробовать запустить вручную
cd /var/www/boltpromo/backend
source /var/www/boltpromo/venv/bin/activate
gunicorn config.wsgi:application
```

### Celery не подключается к Redis

```bash
# Проверить Redis
redis-cli ping

# Проверить REDIS_URL в .env
cat /var/www/boltpromo/backend/.env | grep REDIS

# Проверить логи
journalctl -u celery -n 50
```

### Nginx 502 Bad Gateway

```bash
# Проверить что Gunicorn работает
systemctl status gunicorn

# Проверить socket файл
ls -la /run/gunicorn.sock

# Проверить логи nginx
tail -f /var/log/nginx/boltpromo-api-error.log
```

### SSL сертификаты не работают

```bash
# Проверить сертификаты
sudo certbot certificates

# Проверить конфигурацию nginx
sudo nginx -t

# Посмотреть логи certbot
sudo journalctl -u certbot -n 50
```

## Performance Tuning

### Gunicorn Workers

Рекомендуемое количество workers:
```
workers = (2 × CPU cores) + 1
```

Для 2 CPU cores: 5 workers
Для 4 CPU cores: 9 workers

Измените в `gunicorn.service`:
```ini
ExecStart=/var/www/boltpromo/venv/bin/gunicorn \
    --workers 9 \
    ...
```

### Celery Concurrency

По умолчанию: 4 workers

Увеличьте для CPU-интенсивных задач:
```ini
ExecStart=/var/www/boltpromo/venv/bin/celery -A config worker \
    --concurrency=8 \
    ...
```

### Nginx Buffer Sizes

Для больших запросов:
```nginx
client_body_buffer_size 128k;
client_max_body_size 20M;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

## Security Checklist

- [ ] SSL сертификаты установлены и валидны
- [ ] HSTS enabled (31536000 seconds)
- [ ] Rate limiting настроен
- [ ] Firewall настроен (ufw/iptables)
- [ ] SSH ключи вместо паролей
- [ ] Fail2ban установлен и настроен
- [ ] Регулярные бэкапы настроены
- [ ] Логи ротируются (logrotate)
- [ ] DEBUG=False в .env
- [ ] SECRET_KEY сгенерирован заново
- [ ] Права на файлы корректные (www-data:www-data)
- [ ] PostgreSQL доступен только localhost
- [ ] Redis доступен только localhost

## См. также

- [QUICK_DEPLOY_GUIDE.md](../docs/QUICK_DEPLOY_GUIDE.md) - Полное руководство по деплою
- [ENV_REFERENCE.md](../docs/ENV_REFERENCE.md) - Документация переменных окружения
- [/ops](../ops/) - Скрипты для деплоя и обслуживания

---

**Создано:** 2025-01-10
**Для:** BoltPromo Production Deployment
