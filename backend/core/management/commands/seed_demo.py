"""
Management команда для генерации демо-данных (500-1000 промокодов, 50-100 магазинов)
Использование: python manage.py seed_demo --promos 1000 --stores 100
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
import random
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Генерирует демо-данные: промокоды, магазины, события'

    def add_arguments(self, parser):
        parser.add_argument(
            '--promos',
            type=int,
            default=500,
            help='Количество промокодов для создания (по умолчанию 500)'
        )
        parser.add_argument(
            '--stores',
            type=int,
            default=50,
            help='Количество магазинов для создания (по умолчанию 50)'
        )
        parser.add_argument(
            '--events',
            type=int,
            default=5000,
            help='Количество событий для создания (по умолчанию 5000)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Очистить существующие данные перед генерацией'
        )

    def handle(self, *args, **options):
        from core.models import Store, PromoCode, Category, Event, DailyAgg
        from django.contrib.auth import get_user_model

        promos_count = options['promos']
        stores_count = options['stores']
        events_count = options['events']
        clear_data = options['clear']

        self.stdout.write(
            f"Генерация демо-данных: {stores_count} магазинов, {promos_count} промокодов, {events_count} событий"
        )

        # Очистка данных если нужно
        if clear_data:
            self.stdout.write(self.style.WARNING('Очистка существующих данных...'))
            Event.objects.all().delete()
            DailyAgg.objects.all().delete()
            PromoCode.objects.all().delete()
            Store.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Данные очищены'))

        # Создание категорий
        categories_data = [
            {'name': 'Электроника', 'slug': 'electronics'},
            {'name': 'Одежда и обувь', 'slug': 'fashion'},
            {'name': 'Дом и сад', 'slug': 'home'},
            {'name': 'Красота и здоровье', 'slug': 'beauty'},
            {'name': 'Спорт и отдых', 'slug': 'sports'},
            {'name': 'Продукты питания', 'slug': 'food'},
            {'name': 'Книги и медиа', 'slug': 'books'},
            {'name': 'Игрушки и детское', 'slug': 'kids'},
            {'name': 'Авто и мото', 'slug': 'auto'},
            {'name': 'Услуги', 'slug': 'services'},
        ]

        categories = []
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name'], 'is_active': True}
            )
            categories.append(cat)

        self.stdout.write(self.style.SUCCESS(f'✓ Категории: {len(categories)}'))

        # Создание магазинов
        store_names = [
            'Ozon', 'Wildberries', 'Yandex Market', 'Lamoda', 'Citilink',
            'Mvideo', 'Eldorado', 'DNS', 'Technopark', 'Svyaznoy',
            'Leroy Merlin', 'OBI', 'Ikea', 'Hoff', 'Askona',
            'Perekrestok', 'Magnit', 'Pyaterochka', 'Lenta', 'Metro',
            'Rive Gauche', 'Golden Apple', 'Podruzhka', 'L\'Etoile', 'Ile de Beaute',
            'Sportmaster', 'Decathlon', 'Adidas', 'Nike', 'Reebok',
            'KFC', 'McDonald\'s', 'Burger King', 'Subway', 'Domino\'s Pizza',
            'Chitai-gorod', 'Bookvoed', 'Liters', 'MyShop', 'Labirint',
            'Detsky Mir', 'Toy Ru', 'Mothercare', 'H&M', 'Zara',
            'Sberbank', 'Tinkoff', 'Alfa-Bank', 'VTB', 'Raiffeisen',
        ]

        stores = []
        for i in range(min(stores_count, len(store_names))):
            name = store_names[i]
            slug = name.lower().replace(' ', '-').replace('\'', '')

            store, created = Store.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'rating': round(random.uniform(3.5, 5.0), 1),
                    'description': f'Описание магазина {name}',
                    'site_url': f'https://{slug}.example.com',
                    'is_active': True
                }
            )
            stores.append(store)

        self.stdout.write(self.style.SUCCESS(f'✓ Магазины: {len(stores)}'))

        # Создание промокодов
        offer_types = ['coupon', 'deal', 'financial', 'cashback']
        titles = [
            'Скидка {discount}% на всё',
            'Промокод {code} - {discount}% скидка',
            '{discount}% на первый заказ',
            'Скидка {discount}% на электронику',
            'Бесплатная доставка + {discount}%',
            '{discount}% кэшбэк на всё',
            'Распродажа до {discount}%',
            'Специальное предложение {discount}%',
        ]

        promos = []
        now = timezone.now()

        for i in range(promos_count):
            store = random.choice(stores)
            discount = random.choice([5, 10, 15, 20, 25, 30, 40, 50])
            offer_type = random.choice(offer_types)

            # Генерация expires_at: от -30 дней до +90 дней
            days_offset = random.randint(-30, 90)
            expires_at = now + timedelta(days=days_offset)

            code = f"PROMO{random.randint(1000, 9999)}" if offer_type == 'coupon' else ''
            title_template = random.choice(titles)
            title = title_template.format(discount=discount, code=code)

            promo = PromoCode.objects.create(
                title=title,
                description=f'Описание промокода: {title}',
                store=store,
                offer_type=offer_type,
                code=code,
                discount_value=discount,
                discount_label=f'{discount}% скидка',
                affiliate_url=f'https://{store.slug}.example.com/promo/{code or i}',
                expires_at=expires_at,
                is_active=expires_at > now,  # Только активные если не истекли
                is_hot=random.random() < 0.15,  # 15% горячих
                is_recommended=random.random() < 0.10,  # 10% рекомендованных
                views_count=random.randint(0, 1000)
            )

            # Привязка к категориям
            promo.categories.set(random.sample(categories, k=random.randint(1, 3)))

            promos.append(promo)

            if (i + 1) % 100 == 0:
                self.stdout.write(f'  Создано промокодов: {i + 1}/{promos_count}')

        self.stdout.write(self.style.SUCCESS(f'✓ Промокоды: {len(promos)}'))

        # Создание событий и DailyAgg
        event_types = ['view', 'copy', 'click']
        today = date.today()

        events_created = 0
        dailyagg_data = {}

        for i in range(events_count):
            promo = random.choice(promos)
            event_type = random.choice(event_types)
            days_ago = random.randint(0, 30)
            event_date = today - timedelta(days=days_ago)

            # Создаём сырое событие (часть)
            if random.random() < 0.1:  # 10% сырых событий
                Event.objects.create(
                    event_type=event_type,
                    promo=promo,
                    store=promo.store,
                    ip_address='127.0.0.1',
                    user_agent='Demo/1.0',
                    is_unique=random.random() < 0.7
                )
                events_created += 1

            # Агрегация в DailyAgg
            key = (event_date, event_type, promo.id, promo.store.id)
            if key not in dailyagg_data:
                dailyagg_data[key] = {'count': 0, 'unique': 0}

            dailyagg_data[key]['count'] += 1
            if random.random() < 0.7:
                dailyagg_data[key]['unique'] += 1

        # Создание DailyAgg записей
        dailyagg_objs = []
        for (event_date, event_type, promo_id, store_id), stats in dailyagg_data.items():
            dailyagg_objs.append(
                DailyAgg(
                    date=event_date,
                    event_type=event_type,
                    promo_id=promo_id,
                    store_id=store_id,
                    count=stats['count'],
                    unique_count=stats['unique']
                )
            )

        DailyAgg.objects.bulk_create(dailyagg_objs, ignore_conflicts=True)

        self.stdout.write(self.style.SUCCESS(f'✓ События (сырые): {events_created}'))
        self.stdout.write(self.style.SUCCESS(f'✓ DailyAgg записи: {len(dailyagg_objs)}'))

        # Итоговая статистика
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('✓ Генерация демо-данных завершена!'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'  Категорий: {Category.objects.count()}')
        self.stdout.write(f'  Магазинов: {Store.objects.count()}')
        self.stdout.write(f'  Промокодов: {PromoCode.objects.count()}')
        self.stdout.write(f'  Событий (сырых): {Event.objects.count()}')
        self.stdout.write(f'  DailyAgg: {DailyAgg.objects.count()}')
        self.stdout.write('=' * 60)
