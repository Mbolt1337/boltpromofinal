"""
Тест для проверки stats API
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from core.views_analytics import stats_top_promos, stats_top_stores

# Создаем фейковый запрос
factory = RequestFactory()

print("Testing stats_top_promos...")
request = factory.get('/api/v1/stats/top-promos/', {'range': '7d'})
response = stats_top_promos(request)

print(f"Status: {response.status_code}")
print(f"Response: {response.data}")

if 'results' in response.data:
    print(f"✅ API возвращает корректный формат с ключом 'results'")
    print(f"Количество результатов: {response.data['count']}")
    if response.data['results']:
        print(f"Первый результат: {response.data['results'][0]}")
else:
    print("❌ API не возвращает ключ 'results'")

print("\n" + "="*50 + "\n")

print("Testing stats_top_stores...")
request = factory.get('/api/v1/stats/top-stores/', {'range': '7d'})
response = stats_top_stores(request)

print(f"Status: {response.status_code}")
print(f"Response: {response.data}")

if 'results' in response.data:
    print(f"✅ API возвращает корректный формат с ключом 'results'")
    print(f"Количество результатов: {response.data['count']}")
else:
    print("❌ API не возвращает ключ 'results'")
