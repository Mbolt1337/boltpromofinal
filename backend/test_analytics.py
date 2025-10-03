#!/usr/bin/env python
"""
Тестовый скрипт для проверки аналитики Events -> DailyAgg
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Event, PromoCode, Store, Showcase, DailyAgg
from django.utils import timezone


def check_database():
    """Проверка наличия данных в БД"""
    print("=" * 60)
    print("1. ПРОВЕРКА БАЗЫ ДАННЫХ")
    print("=" * 60)

    promo_count = PromoCode.objects.count()
    store_count = Store.objects.count()
    showcase_count = Showcase.objects.count()
    event_count = Event.objects.count()
    dailyagg_count = DailyAgg.objects.count()

    print(f"[OK] Promocodes: {promo_count}")
    print(f"[OK] Stores: {store_count}")
    print(f"[OK] Showcases: {showcase_count}")
    print(f"[OK] Events: {event_count}")
    print(f"[OK] DailyAgg: {dailyagg_count}")
    print()

    if promo_count == 0:
        print("[WARN]  Нет промокодов! Создайте промокоды через админку.")
        return False

    return True


def create_test_events():
    """Создание тестовых событий"""
    print("=" * 60)
    print("2. СОЗДАНИЕ ТЕСТОВЫХ СОБЫТИЙ")
    print("=" * 60)

    # Получаем первые 3 промокода
    promos = list(PromoCode.objects.all()[:3])
    if not promos:
        print("[ERROR] Нет промокодов для тестирования!")
        return False

    # Получаем магазины и витрины
    stores = list(Store.objects.all()[:2])
    showcases = list(Showcase.objects.all()[:2])

    print(f"Используем {len(promos)} промокодов для теста")

    # Удаляем старые тестовые события
    old_count = Event.objects.filter(client_ip__startswith='127.0.0.').count()
    Event.objects.filter(client_ip__startswith='127.0.0.').delete()
    print(f"Удалено старых тестовых событий: {old_count}")

    # Создаём события за последние 7 дней
    events_created = 0
    now = timezone.now()

    for days_ago in range(7):
        date = now - timedelta(days=days_ago)

        for promo in promos:
            # view событие
            for i in range(10 + days_ago * 2):
                Event.objects.create(
                    event_type='view',
                    promo=promo,
                    store=promo.store if stores else None,
                    showcase=showcases[0] if showcases else None,
                    client_ip=f'127.0.0.{i % 255}',
                    user_agent='Test/1.0',
                    created_at=date
                )
                events_created += 1

            # click событие
            for i in range(5 + days_ago):
                Event.objects.create(
                    event_type='click',
                    promo=promo,
                    store=promo.store if stores else None,
                    showcase=showcases[0] if showcases else None,
                    client_ip=f'127.0.0.{i % 255}',
                    user_agent='Test/1.0',
                    created_at=date
                )
                events_created += 1

            # copy_code событие
            for i in range(2 + days_ago // 2):
                Event.objects.create(
                    event_type='copy_code',
                    promo=promo,
                    store=promo.store if stores else None,
                    client_ip=f'127.0.0.{i % 255}',
                    user_agent='Test/1.0',
                    created_at=date
                )
                events_created += 1

    print(f"[OK] Создано тестовых событий: {events_created}")
    print()

    # Показываем примеры событий
    print("Примеры созданных событий:")
    for event in Event.objects.filter(client_ip__startswith='127.0.0.')[:5]:
        print(f"  - {event.created_at.date()} | {event.event_type:12s} | Promo #{event.promo_id}")
    print()

    return True


def run_aggregation():
    """Запуск агрегации вручную"""
    print("=" * 60)
    print("3. ЗАПУСК АГРЕГАЦИИ")
    print("=" * 60)

    from core.tasks import aggregate_events_hourly

    # Запускаем агрегацию синхронно (без Celery)
    print("Запуск aggregate_events_hourly()...")

    try:
        # Импортируем функцию напрямую из tasks
        from core.tasks import aggregate_events_hourly

        # Вызываем функцию напрямую (не через .delay())
        result = aggregate_events_hourly()
        print(f"[OK] Результат агрегации: {result}")
    except Exception as e:
        print(f"[ERROR] Ошибка агрегации: {e}")
        import traceback
        traceback.print_exc()
        return False

    print()
    return True


def check_dailyagg():
    """Проверка DailyAgg после агрегации"""
    print("=" * 60)
    print("4. ПРОВЕРКА DAILYAGG")
    print("=" * 60)

    total = DailyAgg.objects.count()
    print(f"Всего записей в DailyAgg: {total}")

    if total == 0:
        print("[WARN]  DailyAgg пуст! Агрегация не сработала.")
        return False

    # Группируем по типу события
    print("\nРаспределение по типам:")
    from django.db.models import Sum
    for event_type in ['view', 'click', 'copy_code']:
        total_count = DailyAgg.objects.filter(event_type=event_type).aggregate(
            total=Sum('count')
        )['total'] or 0
        print(f"  {event_type:12s}: {total_count}")

    # Последние записи
    print("\nПоследние 5 записей:")
    for agg in DailyAgg.objects.all().order_by('-date', '-count')[:5]:
        print(f"  {agg.date} | {agg.event_type:12s} | Promo #{agg.promo_id} | Count: {agg.count} | Unique: {agg.unique_count}")

    print()
    return True


def test_api():
    """Тестирование API статистики"""
    print("=" * 60)
    print("5. ТЕСТИРОВАНИЕ API")
    print("=" * 60)

    from core.views_analytics import stats_top_promos, stats_top_stores, stats_types_share
    from django.test import RequestFactory

    factory = RequestFactory()

    # Test top promos
    print("Тест: /api/v1/stats/top-promos?range=7d")
    request = factory.get('/api/v1/stats/top-promos', {'range': '7d'})
    response = stats_top_promos(request)
    data = response.data
    print(f"  Статус: {response.status_code}")
    print(f"  Результатов: {len(data)}")
    if data:
        print(f"  Топ промокод: Promo #{data[0]['promo_id']} ({data[0]['clicks']} кликов)")
    print()

    # Test types share
    print("Тест: /api/v1/stats/types-share?range=7d")
    request = factory.get('/api/v1/stats/types-share', {'range': '7d'})
    response = stats_types_share(request)
    data = response.data
    print(f"  Статус: {response.status_code}")
    print(f"  Результатов: {len(data)}")
    for item in data:
        print(f"    {item['event_type']:12s}: {item['count']} ({item['percentage']:.1f}%)")
    print()

    return True


def check_frontend_tracking():
    """Проверка отправки событий с frontend"""
    print("=" * 60)
    print("6. ПРОВЕРКА FRONTEND TRACKING")
    print("=" * 60)

    # Проверяем последние события (не тестовые)
    real_events = Event.objects.exclude(client_ip__startswith='127.0.0.').order_by('-created_at')[:10]

    if real_events.count() == 0:
        print("[WARN]  Нет реальных событий с frontend!")
        print()
        print("Возможные причины:")
        print("1. Frontend не отправляет события на /api/v1/analytics/track")
        print("2. API endpoint не работает")
        print("3. CORS блокирует запросы")
        print()
        print("Проверьте:")
        print("- Открыть DevTools → Network → Filter: track")
        print("- Кликнуть по промокоду")
        print("- Должен быть POST запрос на /api/v1/analytics/track")
        return False

    print(f"[OK] Найдено {real_events.count()} реальных событий с frontend:")
    for event in real_events[:5]:
        print(f"  {event.created_at} | {event.event_type:12s} | IP: {event.client_ip}")

    print()
    return True


def main():
    print("\n" + "=" * 60)
    print("ТЕСТИРОВАНИЕ АНАЛИТИКИ BOLTPROMO")
    print("=" * 60 + "\n")

    # 1. Проверка БД
    if not check_database():
        print("\n[ERROR] Тест прерван: нет данных в БД")
        return

    # 2. Создание тестовых событий
    if not create_test_events():
        print("\n[ERROR] Не удалось создать тестовые события")
        return

    # 3. Запуск агрегации
    if not run_aggregation():
        print("\n[ERROR] Агрегация не выполнена")
        return

    # 4. Проверка DailyAgg
    if not check_dailyagg():
        print("\n[ERROR] DailyAgg пуст после агрегации")
        return

    # 5. Тест API
    test_api()

    # 6. Проверка frontend tracking
    check_frontend_tracking()

    print("\n" + "=" * 60)
    print("✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО")
    print("=" * 60)
    print("\nСледующие шаги:")
    print("1. Откройте http://127.0.0.1:8000/admin/core/stats/")
    print("2. Графики должны показывать данные")
    print("3. Если графики пустые - проверьте консоль браузера (DevTools)")
    print()


if __name__ == '__main__':
    main()
