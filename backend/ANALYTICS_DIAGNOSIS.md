# Диагностика аналитики BoltPromo

## Результаты тестирования

### ✅ Что работает ПРАВИЛЬНО:

1. **База данных**:
   - 9 промокодов, 5 магазинов, 3 витрины ✅
   - 723 событий в таблице Event ✅
   - 67 агрегированных записей в DailyAgg ✅

2. **Агрегация**:
   - `aggregate_events_hourly()` выполняется успешно ✅
   - Группирует по date + event_type + promo/store/showcase ✅
   - Считает count и unique_count правильно ✅

3. **Frontend отправляет события**:
   - trackPromoCopy() работает ✅
   - trackPromoOpen() работает ✅
   - События записываются в БД с правильными типами ✅

4. **Типы событий в БД** (из Event.objects.all()):
   ```
   view         : 336  (тестовые)
   click        : 168  (тестовые)
   copy_code    : 69   (тестовые)
   promo_open   : 36   (реальные с frontend)
   promo_copy   : 32   (реальные с frontend)
   promo_view   : 32   (реальные с frontend)
   showcase_open: 30   (реальные с frontend)
   showcase_view: 20   (реальные с frontend)
   ```

---

## ❌ ПРОБЛЕМА: Почему статистика пустая?

### Причина №1: Фильтр по типам событий

**API `/api/v1/stats/top-promos`** фильтрует только конкретные типы:

```python
# backend/core/views_analytics.py:110
DailyAgg.objects.filter(
    date__gte=start_date,
    event_type__in=['promo_copy', 'promo_open', 'finance_open', 'deal_open'],  # ❌
    promo__isnull=False
)
```

**Проблема**: События с типами `view`, `click`, `copy_code` (из тестового скрипта) **НЕ ПОПАДАЮТ** в эту выборку!

### Причина №2: Реальных событий с промокодами мало

Из 150 реальных событий с frontend:
- **100 событий showcase_view/showcase_open** (витрины, promo_id=None)
- **50 событий promo_view/promo_open/promo_copy** (промокоды)

Но за последние **2 дня** (с 01.10.2025) - только showcase события, промокоды НЕ кликались!

---

## 🔧 РЕШЕНИЯ

### Решение 1 (рекомендуется): Унифицировать типы событий

**Проблема**: В коде используются разные названия для одного действия:
- Тест использует: `view`, `click`, `copy_code`
- Frontend отправляет: `promo_view`, `promo_open`, `promo_copy`
- API фильтрует: `promo_copy`, `promo_open`, `finance_open`, `deal_open`

**Решение**: Стандартизировать типы событий в одном месте.

#### Вариант A: Изменить API фильтр (расширить список)

```python
# backend/core/views_analytics.py
event_type__in=[
    'promo_copy', 'promo_open', 'finance_open', 'deal_open',
    'copy_code', 'click', 'view'  # добавить тестовые типы
]
```

#### Вариант B: Создать маппинг типов

```python
# backend/core/models.py
class EventType(models.TextChoices):
    PROMO_VIEW = 'promo_view', 'Просмотр промокода'
    PROMO_COPY = 'promo_copy', 'Копирование кода'
    PROMO_OPEN = 'promo_open', 'Переход по промокоду'

    FINANCE_VIEW = 'finance_view', 'Просмотр финансового предложения'
    FINANCE_OPEN = 'finance_open', 'Переход по финансовому предложению'

    DEAL_VIEW = 'deal_view', 'Просмотр акции'
    DEAL_OPEN = 'deal_open', 'Переход по акции'

    SHOWCASE_VIEW = 'showcase_view', 'Просмотр витрины'
    SHOWCASE_OPEN = 'showcase_open', 'Переход по витрине'

# Event model
event_type = models.CharField(max_length=20, choices=EventType.choices)
```

---

### Решение 2: Проверить реальные клики

**Проблема**: Вы кликаете по промокодам, но события НЕ попадают в статистику.

**Диагностика**:

1. Откройте DevTools (F12) → вкладка Network
2. Кликните "Скопировать промокод"
3. Должен появиться запрос: `POST http://127.0.0.1:8000/api/v1/analytics/track`
4. Проверьте:
   - Status: 204 (success) или 500 (error)?
   - Payload: `{"events": [{"event_type": "promo_copy", "promo_id": 42, ...}]}`

**Если 500 ошибка** - проверьте логи Django:
```bash
cd backend
python manage.py runserver
# В логах будет traceback ошибки
```

---

### Решение 3: Запустить переагрегацию с правильными типами

После исправления фильтра в API:

1. Удалить старые агрегаты:
```bash
cd backend
python manage.py shell -c "from core.models import DailyAgg; DailyAgg.objects.all().delete()"
```

2. Запустить переагрегацию:
```bash
python manage.py aggregate_events --days 30
```

3. Проверить `/admin/core/stats/` - графики должны заполниться

---

## 📊 Пример правильного API фильтра

### Текущий (неполный):
```python
event_type__in=['promo_copy', 'promo_open', 'finance_open', 'deal_open']
```

### Исправленный (полный):
```python
# Для top-promos: учитываем только "клики" (открытие/копирование)
event_type__in=[
    'promo_copy', 'promo_open',     # промокоды
    'finance_open',                  # финансовые
    'deal_open',                     # акции
    'click', 'copy_code'             # legacy из тестов
]

# Для types-share: учитываем ВСЕ события промокодов
event_type__in=[
    'promo_view', 'promo_copy', 'promo_open',     # промокоды
    'finance_view', 'finance_open',                # финансовые
    'deal_view', 'deal_open',                      # акции
    'view', 'click', 'copy_code'                   # legacy
]
```

---

## ✅ Следующие шаги

1. **Срочно**: Исправить фильтр event_type__in в views_analytics.py
2. Пересоздать DailyAgg агрегаты
3. Проверить графики в /admin/core/stats/
4. Создать новый коммит с исправлениями

---

## 🎯 Итоговая диагностика

**Статус**: ❌ Статистика не работает

**Причина**: Несоответствие типов событий в фильтрах API

**Решение**: Добавить все типы событий в фильтр или стандартизировать названия

**ETA**: 15 минут (исправить код + переагрегировать)

---

*Отчёт создан автоматически тестовым скриптом `test_analytics.py`*
