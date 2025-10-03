# Мониторинг и Безопасность - Инструменты BoltPromo

## 🛠️ Установленные инструменты

### 1. **Sentry** - Мониторинг ошибок

**Что делает:** Отслеживает все runtime ошибки в production

**Настройка:**
```bash
# В .env добавить:
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Использование:**
- Автоматически логирует все необработанные исключения
- Performance monitoring (20% транзакций)
- Интеграция с Django, Celery, Redis
- GDPR-compliant (send_default_pii=False)

**Проверка:**
```python
# Тестовая ошибка (только в dev):
import sentry_sdk
sentry_sdk.capture_message("Test Sentry integration")
```

---

### 2. **django-silk** - Профилинг запросов

**Что делает:** Отслеживает SQL queries и view performance

**Настройка:**
- Автоматически включен при DEBUG=True
- Для production: `ENABLE_SILK=True` в .env (для staff)

**Использование:**
1. Откройте http://localhost:8000/silk/
2. Выполните действия на сайте
3. Вернитесь в Silk → увидите:
   - Список всех HTTP запросов
   - SQL queries (количество, время)
   - N+1 query problems
   - View execution time

**Примеры:**
- Поиск медленных запросов: Silk → Requests → Sort by Time
- N+1 detection: Silk → SQL Queries → Similar Queries

---

### 3. **django-ipware** - Безопасный IP

**Что делает:** Корректно извлекает real client IP за proxy/CDN

**Использование:**
```python
from ipware import get_client_ip

client_ip, is_routable = get_client_ip(request)
if client_ip is None:
    client_ip = 'unknown'
```

**Применено в:**
- `backend/core/views_analytics.py:track_events()` - трекинг событий
- `backend/core/views.py:ContactMessageCreateView.get_client_ip()` - контакт-форма

**Защита от:**
- Подделка X-Forwarded-For заголовка
- Bypass rate limiting через фальшивые IP
- Некорректное определение IP за nginx/cloudflare

---

### 4. **django-ratelimit** - Anti-spam

**Что делает:** Ограничивает количество запросов с одного IP

**Настройка:**
```python
from ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='60/m', block=True)
def my_view(request):
    # ...
```

**Применено в:**
- `/api/v1/analytics/track` - 60 запросов/минуту

**Тестирование:**
```bash
# Отправить 61 запрос за минуту:
for i in {1..61}; do
  curl -X POST http://localhost:8000/api/v1/analytics/track \
    -H "Content-Type: application/json" \
    -d '{"events":[{"event_type":"test"}]}'
done

# 61-й запрос вернёт 429:
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retry_after": 60
}
```

**Где ещё добавить:**
- Contact form (3 сообщения/час)
- Search API (30 запросов/минуту)
- Login attempts (5/час)

---

## 🔍 Как использовать для диагностики

### Сценарий 1: Медленная страница

1. Откройте http://localhost:8000/silk/
2. Перейдите на медленную страницу
3. В Silk найдите запрос → кликните
4. Смотрите:
   - SQL Queries (сколько? какие дубликаты?)
   - View time (где bottleneck?)
5. Исправляйте:
   - N+1: добавить `select_related()`/`prefetch_related()`
   - Медленные queries: добавить индексы

### Сценарий 2: Ошибка в production

1. Откройте Sentry dashboard
2. Найдите error event
3. Смотрите:
   - Full traceback
   - Request context (URL, user, IP)
   - Breadcrumbs (что делал пользователь)
4. Воспроизводите локально и фиксите

### Сценарий 3: Spam атака

1. Откройте логи: `tail -f /var/log/nginx/access.log`
2. Видите множество 429 ошибок? → Rate limit сработал
3. Проверьте IP атакующего
4. При необходимости добавить в firewall ban

---

## 📊 Метрики для мониторинга

### В Silk (локально):
- [ ] Нет запросов >1s
- [ ] Нет N+1 queries (>10 однотипных SELECT)
- [ ] Views выполняются <500ms

### В Sentry (production):
- [ ] <10 ошибок в день
- [ ] Response time p95 <1s
- [ ] Memory usage стабильна
- [ ] No memory leaks

### Rate Limiting:
- [ ] 429 errors <1% всех запросов
- [ ] Legitimate users не блокируются

---

## 🚀 Следующие шаги

1. **Добавить rate limiting на:**
   - Contact form
   - Search API
   - Auth endpoints

2. **Настроить Sentry alerts:**
   - Email при critical errors
   - Slack notification для production

3. **Создать Silk rules:**
   - Highlight slow queries (>100ms)
   - Flag N+1 problems automatically

4. **Мониторинг Celery:**
   - Sentry уже интегрирован
   - Добавить Flower для UI (опционально)

---

**Документация:**
- Sentry: https://docs.sentry.io/platforms/python/integrations/django/
- Silk: https://github.com/jazzband/django-silk
- ipware: https://github.com/un33k/django-ipware
- ratelimit: https://django-ratelimit.readthedocs.io/
