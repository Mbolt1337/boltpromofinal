# Environment Variables Reference

## Backend Environment Variables

### Django Core

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEBUG` | **Yes** | - | Must be `False` in production. Controls debug mode. |
| `SECRET_KEY` | **Yes** | - | Django secret key. Generate with `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'` |
| `ALLOWED_HOSTS` | **Yes** | - | Comma-separated list of allowed hostnames (e.g., `yourdomain.ru,www.yourdomain.ru`) |

### Database (PostgreSQL)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_NAME` | **Yes** | - | PostgreSQL database name |
| `DB_USER` | **Yes** | - | PostgreSQL username |
| `DB_PASSWORD` | **Yes** | - | PostgreSQL password |
| `DB_HOST` | **Yes** | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |

### Redis & Celery

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | **Yes** | - | Redis connection URL (e.g., `redis://localhost:6379/0`) |
| `CELERY_BROKER_URL` | **Yes** | - | Celery broker URL (usually same as REDIS_URL) |
| `CELERY_RESULT_BACKEND` | **Yes** | - | Celery result backend (usually same as REDIS_URL) |

### CORS & CSRF

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | **Yes** | - | Comma-separated frontend URLs with protocol (e.g., `https://yourdomain.ru,https://www.yourdomain.ru`) |
| `CSRF_TRUSTED_ORIGINS` | **Yes** | - | Same as CORS_ALLOWED_ORIGINS |

### SEO

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CANONICAL_HOST` | No | - | Canonical domain for SEO (without www, without protocol) |

### Email (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMAIL_HOST` | No | `smtp.yandex.ru` | SMTP server |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_HOST_USER` | No | - | SMTP username |
| `EMAIL_HOST_PASSWORD` | No | - | SMTP password |
| `EMAIL_USE_TLS` | No | `True` | Use TLS |
| `DEFAULT_FROM_EMAIL` | No | - | Default sender email |

### Monitoring (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | No | - | Sentry error tracking DSN |

### Development Tools

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_SILK` | No | `False` | Enable Silk profiler (development only!) |

### Static & Media (Optional)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STATIC_URL` | No | `/static/` | Static files URL (for CDN) |
| `MEDIA_URL` | No | `/media/` | Media files URL (for CDN) |

---

## Frontend Environment Variables

### Core Settings

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | - | Backend API URL (e.g., `https://api.yourdomain.ru`) |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | - | Frontend URL (e.g., `https://yourdomain.ru`) |
| `NEXT_TELEMETRY_DISABLED` | No | `1` | Disable Next.js telemetry |

---

## Security Notes

### Critical Security Rules

1. **Never commit .env files to git**
2. **Never use default SECRET_KEY**
3. **Never set DEBUG=True in production**
4. **Always use strong passwords for DB_PASSWORD**
5. **Always use HTTPS URLs in CORS/CSRF origins**

### Generating Secure Values

**SECRET_KEY:**
```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

**DB_PASSWORD:**
```bash
python -c 'import secrets; print(secrets.token_urlsafe(32))'
```

---

## Example Configurations

### Development (.env)
```bash
DEBUG=True
SECRET_KEY=dev-only-insecure-key
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=boltpromo_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

### Production (.env.production)
```bash
DEBUG=False
SECRET_KEY=<generated-secret-key>
ALLOWED_HOSTS=yourdomain.ru,www.yourdomain.ru,api.yourdomain.ru
DB_NAME=boltpromo_prod
DB_USER=boltpromo_user
DB_PASSWORD=<strong-password>
DB_HOST=localhost
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=https://yourdomain.ru,https://www.yourdomain.ru
CSRF_TRUSTED_ORIGINS=https://yourdomain.ru,https://www.yourdomain.ru
CANONICAL_HOST=yourdomain.ru
EMAIL_HOST=smtp.yandex.ru
EMAIL_HOST_USER=noreply@yourdomain.ru
EMAIL_HOST_PASSWORD=<email-password>
DEFAULT_FROM_EMAIL=noreply@yourdomain.ru
ENABLE_SILK=False
```

---

**Created:** 2025-01-10
**For:** BoltPromo Environment Configuration
**See also:** QUICK_DEPLOY_GUIDE.md
