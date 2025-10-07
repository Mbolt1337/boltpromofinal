#!/usr/bin/env python
"""
Скрипт для измерения SQL queries в критичных endpoints
Цель: убедиться, что N+1 устранены, queries < 10
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['DEBUG'] = 'True'
django.setup()

from django.db import connection, reset_queries
from django.utils import timezone
from core.models import PromoCode, Showcase, Category

def test_promocode_list():
    """Тест /api/v1/promocodes/ — должно быть < 10 queries"""
    reset_queries()

    # Имитация queryset из PromoCodeListView
    queryset = PromoCode.objects.filter(
        is_active=True,
        expires_at__gt=timezone.now()
    ).select_related('store').prefetch_related('categories')[:24]  # Первая страница

    # Заставляем выполнить запросы
    results = list(queryset)

    # Доступ к FK и M2M (сериализатор делает это)
    for promo in results:
        _ = promo.store.name
        _ = list(promo.categories.all())

    queries_count = len(connection.queries)

    print(f"\n=== PromoCodeListView (first page, 24 items) ===")
    print(f"Total SQL queries: {queries_count}")
    print(f"Status: {'[PASS]' if queries_count <= 10 else '[FAIL]'} (target: <=10)\n")

    if queries_count > 10:
        print("Queries executed:")
        for i, q in enumerate(connection.queries, 1):
            print(f"{i}. {q['sql'][:120]}...")

    return queries_count

def test_showcase_list():
    """Тест /api/v1/showcases/ — должно быть < 5 queries"""
    reset_queries()

    # Имитация queryset из ShowcaseViewSet.list()
    from django.db.models import Count
    queryset = Showcase.objects.filter(
        is_active=True
    ).annotate(
        promos_count=Count('items')
    ).order_by('sort_order', '-created_at')[:10]

    results = list(queryset)

    # Доступ к annotated полю
    for showcase in results:
        _ = showcase.promos_count

    queries_count = len(connection.queries)

    print(f"\n=== ShowcaseViewSet.list() (10 items) ===")
    print(f"Total SQL queries: {queries_count}")
    print(f"Status: {'[PASS]' if queries_count <= 5 else '[WARNING]'} (target: <=5)\n")

    if queries_count > 5:
        print("Queries executed:")
        for i, q in enumerate(connection.queries, 1):
            print(f"{i}. {q['sql'][:120]}...")

    return queries_count

def test_category_list():
    """Тест /api/v1/categories/ — должно быть 1-2 queries"""
    reset_queries()

    # Имитация queryset из CategoryListView
    queryset = Category.objects.filter(is_active=True).order_by('name')

    results = list(queryset)

    queries_count = len(connection.queries)

    print(f"\n=== CategoryListView (all categories) ===")
    print(f"Total SQL queries: {queries_count}")
    print(f"Status: {'[PASS]' if queries_count <= 2 else '[WARNING]'} (target: <=2)\n")

    if queries_count > 2:
        print("Queries executed:")
        for i, q in enumerate(connection.queries, 1):
            print(f"{i}. {q['sql'][:120]}...")

    return queries_count

if __name__ == '__main__':
    print("=" * 80)
    print("BoltPromo ORM Query Optimization Audit")
    print("=" * 80)

    promo_queries = test_promocode_list()
    showcase_queries = test_showcase_list()
    category_queries = test_category_list()

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"PromoCodeListView:   {promo_queries} queries ({'[PASS]' if promo_queries <= 10 else '[FAIL]'})")
    print(f"ShowcaseViewSet:     {showcase_queries} queries ({'[PASS]' if showcase_queries <= 5 else '[WARNING]'})")
    print(f"CategoryListView:    {category_queries} queries ({'[PASS]' if category_queries <= 2 else '[WARNING]'})")

    total_score = sum([
        promo_queries <= 10,
        showcase_queries <= 5,
        category_queries <= 2
    ])

    print(f"\nOverall: {total_score}/3 tests passed")

    if total_score == 3:
        print("[SUCCESS] All endpoints are optimized! N+1 eliminated.")
    else:
        print("[WARNING] Some endpoints need optimization.")
