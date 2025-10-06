"""
Unit tests для popular ordering

Тестируем логику сортировки промокодов:
1. Badges first (is_hot OR is_recommended)
2. Usage 7d (clicks + copies за последние 7 дней)
3. Freshness (created_at)
"""

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from core.models import PromoCode, Store, Category, DailyAgg
from django.contrib.auth import get_user_model

User = get_user_model()


class PopularOrderingTestCase(TestCase):
    """Тестирование сортировки по популярности"""

    def setUp(self):
        """Подготовка тестовых данных"""
        self.client = APIClient()

        # Создаём категорию и магазин
        self.category = Category.objects.create(
            name='Электроника',
            slug='electronics'
        )

        self.store = Store.objects.create(
            name='TestStore',
            slug='teststore',
            url='https://teststore.com'
        )

        # Даты для тестирования
        self.now = timezone.now()
        self.week_ago = (self.now - timedelta(days=7)).date()
        self.yesterday = (self.now - timedelta(days=1)).date()

    def test_badges_first_hot_promo(self):
        """is_hot промокоды должны быть первыми"""

        # Промокод с is_hot=True и минимальными кликами
        hot_promo = PromoCode.objects.create(
            title='Hot Promo',
            code='HOT100',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=True,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промокод без бейджа, но с большим количеством кликов
        popular_promo = PromoCode.objects.create(
            title='Popular Promo',
            code='POP200',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Создаём клики для popular_promo (1000 кликов)
        DailyAgg.objects.create(
            promo=popular_promo,
            date=self.yesterday,
            event_type='click',
            count=1000
        )

        # Запрос с ordering=popular
        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # hot_promo должен быть первым, несмотря на меньшее количество кликов
        self.assertEqual(results[0]['id'], hot_promo.id)
        self.assertEqual(results[1]['id'], popular_promo.id)

    def test_badges_first_recommended_promo(self):
        """is_recommended промокоды должны быть первыми"""

        # Промокод с is_recommended=True
        recommended_promo = PromoCode.objects.create(
            title='Recommended Promo',
            code='REC300',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_recommended=True,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промокод без бейджа с кликами
        normal_promo = PromoCode.objects.create(
            title='Normal Promo',
            code='NORM400',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_recommended=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # 500 кликов для normal_promo
        DailyAgg.objects.create(
            promo=normal_promo,
            date=self.yesterday,
            event_type='click',
            count=500
        )

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # recommended_promo первым
        self.assertEqual(results[0]['id'], recommended_promo.id)
        self.assertEqual(results[1]['id'], normal_promo.id)

    def test_usage_7d_ordering(self):
        """Сортировка по usage_7d (клики + копирования) для промо без бейджей"""

        # Промо с 1000 кликов
        promo_1000 = PromoCode.objects.create(
            title='Promo 1000',
            code='P1000',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промо с 500 кликов
        promo_500 = PromoCode.objects.create(
            title='Promo 500',
            code='P500',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промо с 200 кликов
        promo_200 = PromoCode.objects.create(
            title='Promo 200',
            code='P200',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Создаём DailyAgg записи
        DailyAgg.objects.create(promo=promo_1000, date=self.yesterday, event_type='click', count=1000)
        DailyAgg.objects.create(promo=promo_500, date=self.yesterday, event_type='click', count=500)
        DailyAgg.objects.create(promo=promo_200, date=self.yesterday, event_type='click', count=200)

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # Порядок: 1000 → 500 → 200
        self.assertEqual(results[0]['id'], promo_1000.id)
        self.assertEqual(results[1]['id'], promo_500.id)
        self.assertEqual(results[2]['id'], promo_200.id)

    def test_usage_7d_clicks_plus_copies(self):
        """usage_7d должен учитывать и клики, и копирования"""

        # Промо с 300 кликов + 200 копирований = 500 total
        promo_mixed = PromoCode.objects.create(
            title='Promo Mixed',
            code='PMIX',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промо с 400 кликов (без копирований)
        promo_clicks = PromoCode.objects.create(
            title='Promo Clicks',
            code='PCLICK',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # DailyAgg для promo_mixed
        DailyAgg.objects.create(promo=promo_mixed, date=self.yesterday, event_type='click', count=300)
        DailyAgg.objects.create(promo=promo_mixed, date=self.yesterday, event_type='copy', count=200)

        # DailyAgg для promo_clicks
        DailyAgg.objects.create(promo=promo_clicks, date=self.yesterday, event_type='click', count=400)

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # promo_mixed (500 total) должен быть первым
        self.assertEqual(results[0]['id'], promo_mixed.id)
        self.assertEqual(results[1]['id'], promo_clicks.id)

    def test_freshness_ordering_when_no_usage(self):
        """Сортировка по created_at для промокодов без кликов"""

        # Старый промокод (7 дней назад)
        old_promo = PromoCode.objects.create(
            title='Old Promo',
            code='OLD',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(days=7)
        )

        # Новый промокод (вчера)
        new_promo = PromoCode.objects.create(
            title='New Promo',
            code='NEW',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(days=1)
        )

        # Нет DailyAgg записей (оба промо без кликов)

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # Новый промокод должен быть первым
        self.assertEqual(results[0]['id'], new_promo.id)
        self.assertEqual(results[1]['id'], old_promo.id)

    def test_combined_ordering_badges_usage_freshness(self):
        """Полная проверка: badges → usage → freshness"""

        # 1. Hot промо (старый, мало кликов)
        hot_old = PromoCode.objects.create(
            title='Hot Old',
            code='HOTOLD',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=True,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(days=10)
        )
        DailyAgg.objects.create(promo=hot_old, date=self.yesterday, event_type='click', count=10)

        # 2. Recommended промо (новый, средние клики)
        rec_new = PromoCode.objects.create(
            title='Rec New',
            code='RECNEW',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_recommended=True,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(days=1)
        )
        DailyAgg.objects.create(promo=rec_new, date=self.yesterday, event_type='click', count=100)

        # 3. Обычный промо с большими кликами (500)
        normal_popular = PromoCode.objects.create(
            title='Normal Popular',
            code='NORMPOP',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_recommended=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(days=5)
        )
        DailyAgg.objects.create(promo=normal_popular, date=self.yesterday, event_type='click', count=500)

        # 4. Обычный промо с малыми кликами (50), но новый
        normal_new = PromoCode.objects.create(
            title='Normal New',
            code='NORMNEW',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_recommended=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(hours=1)
        )
        DailyAgg.objects.create(promo=normal_new, date=self.yesterday, event_type='click', count=50)

        # 5. Обычный промо с малыми кликами (50), старый
        normal_old = PromoCode.objects.create(
            title='Normal Old',
            code='NORMOLD',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_recommended=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30),
            created_at=self.now - timedelta(days=20)
        )
        DailyAgg.objects.create(promo=normal_old, date=self.yesterday, event_type='click', count=50)

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # Ожидаемый порядок:
        # 1. hot_old (badge, даже со старой датой и малыми кликами)
        # 2. rec_new (badge)
        # 3. normal_popular (500 кликов)
        # 4. normal_new (50 кликов, но новый)
        # 5. normal_old (50 кликов, старый)

        self.assertEqual(results[0]['id'], hot_old.id, "Hot промо должен быть первым")
        self.assertEqual(results[1]['id'], rec_new.id, "Recommended промо должен быть вторым")
        self.assertEqual(results[2]['id'], normal_popular.id, "Популярный промо третьим")
        self.assertEqual(results[3]['id'], normal_new.id, "Новый промо с малыми кликами четвёртым")
        self.assertEqual(results[4]['id'], normal_old.id, "Старый промо с малыми кликами последним")

    def test_only_last_7_days_events_counted(self):
        """usage_7d должен учитывать только события за последние 7 дней"""

        # Промо с кликами 8 дней назад (не должны учитываться)
        promo_old_clicks = PromoCode.objects.create(
            title='Old Clicks',
            code='OLDCLICK',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промо с кликами вчера (должны учитываться)
        promo_recent = PromoCode.objects.create(
            title='Recent Clicks',
            code='RECENT',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Клики 8 дней назад
        DailyAgg.objects.create(
            promo=promo_old_clicks,
            date=(self.now - timedelta(days=8)).date(),
            event_type='click',
            count=1000
        )

        # Клики вчера
        DailyAgg.objects.create(
            promo=promo_recent,
            date=self.yesterday,
            event_type='click',
            count=100
        )

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # promo_recent должен быть первым (100 кликов за 7 дней)
        # promo_old_clicks вторым (0 кликов за 7 дней)
        self.assertEqual(results[0]['id'], promo_recent.id)
        self.assertEqual(results[1]['id'], promo_old_clicks.id)

    def test_views_not_counted_in_usage_7d(self):
        """Просмотры (views) НЕ должны учитываться в usage_7d"""

        # Промо с 1000 просмотров
        promo_views = PromoCode.objects.create(
            title='Promo Views',
            code='VIEWS',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # Промо с 100 кликов
        promo_clicks = PromoCode.objects.create(
            title='Promo Clicks',
            code='CLICKS',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        # 1000 просмотров для promo_views
        DailyAgg.objects.create(promo=promo_views, date=self.yesterday, event_type='view', count=1000)

        # 100 кликов для promo_clicks
        DailyAgg.objects.create(promo=promo_clicks, date=self.yesterday, event_type='click', count=100)

        response = self.client.get('/api/v1/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # promo_clicks должен быть первым (100 кликов учитываются)
        # promo_views вторым (1000 просмотров НЕ учитываются)
        self.assertEqual(results[0]['id'], promo_clicks.id)
        self.assertEqual(results[1]['id'], promo_views.id)

    def test_popular_ordering_in_category_view(self):
        """Проверка работы popular ordering в CategoryPromocodesView"""

        # Создаём промокоды в категории
        hot_promo = PromoCode.objects.create(
            title='Hot in Category',
            code='HOTCAT',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=True,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        normal_promo = PromoCode.objects.create(
            title='Normal in Category',
            code='NORMCAT',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        DailyAgg.objects.create(promo=normal_promo, date=self.yesterday, event_type='click', count=500)

        response = self.client.get(f'/api/v1/categories/{self.category.slug}/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # hot_promo первым (badge важнее кликов)
        self.assertEqual(results[0]['id'], hot_promo.id)
        self.assertEqual(results[1]['id'], normal_promo.id)

    def test_popular_ordering_in_store_view(self):
        """Проверка работы popular ordering в StorePromocodesView"""

        # Создаём промокоды для магазина
        recommended = PromoCode.objects.create(
            title='Recommended in Store',
            code='RECSTORE',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_recommended=True,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        popular = PromoCode.objects.create(
            title='Popular in Store',
            code='POPSTORE',
            promo_type='coupon',
            category=self.category,
            store=self.store,
            is_hot=False,
            is_recommended=False,
            is_active=True,
            expires_at=self.now + timedelta(days=30)
        )

        DailyAgg.objects.create(promo=popular, date=self.yesterday, event_type='click', count=800)

        response = self.client.get(f'/api/v1/stores/{self.store.slug}/promos/?ordering=popular')

        self.assertEqual(response.status_code, 200)
        results = response.json()['results']

        # recommended первым (badge)
        # popular вторым (800 кликов)
        self.assertEqual(results[0]['id'], recommended.id)
        self.assertEqual(results[1]['id'], popular.id)
