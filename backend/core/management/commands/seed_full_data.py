from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import Category, Store, PromoCode
import random


class Command(BaseCommand):
    help = 'Создает полный набор тестовых данных для BoltPromo (10-15 категорий, магазины, промокоды)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Создание расширенного набора тестовых данных...'))

        # 15 категорий с описаниями и иконками
        categories_data = [
            {
                'name': 'Электроника и гаджеты',
                'slug': 'elektronika',
                'icon': 'Smartphone',
                'description': 'Смартфоны, планшеты, ноутбуки, умные часы и аксессуары'
            },
            {
                'name': 'Одежда и обувь',
                'slug': 'odezhda-obuv',
                'icon': 'ShirtIcon',
                'description': 'Модная одежда, обувь и аксессуары для мужчин, женщин и детей'
            },
            {
                'name': 'Красота и здоровье',
                'slug': 'krasota-zdorovie',
                'icon': 'Sparkles',
                'description': 'Косметика, парфюмерия, средства по уходу и товары для здоровья'
            },
            {
                'name': 'Дом и интерьер',
                'slug': 'dom-interer',
                'icon': 'Home',
                'description': 'Мебель, текстиль, декор, посуда и товары для уюта'
            },
            {
                'name': 'Спорт и отдых',
                'slug': 'sport-otdyh',
                'icon': 'Dumbbell',
                'description': 'Спортивная одежда, инвентарь, фитнес и туристическое снаряжение'
            },
            {
                'name': 'Детские товары',
                'slug': 'detskie-tovary',
                'icon': 'Baby',
                'description': 'Игрушки, одежда, питание и всё необходимое для детей'
            },
            {
                'name': 'Продукты питания',
                'slug': 'produkty',
                'icon': 'ShoppingCart',
                'description': 'Продукты, деликатесы, напитки и готовая еда с доставкой'
            },
            {
                'name': 'Бытовая техника',
                'slug': 'bytovaya-tehnika',
                'icon': 'Zap',
                'description': 'Крупная и мелкая бытовая техника для дома и кухни'
            },
            {
                'name': 'Книги и образование',
                'slug': 'knigi-obrazovanie',
                'icon': 'BookOpen',
                'description': 'Книги, учебники, онлайн-курсы и образовательные материалы'
            },
            {
                'name': 'Авто и мото',
                'slug': 'avto-moto',
                'icon': 'Car',
                'description': 'Запчасти, аксессуары, масла и товары для автомобилей'
            },
            {
                'name': 'Путешествия',
                'slug': 'puteshestviya',
                'icon': 'Plane',
                'description': 'Авиабилеты, отели, туры и аренда транспорта'
            },
            {
                'name': 'Рестораны и кафе',
                'slug': 'restorany-kafe',
                'icon': 'UtensilsCrossed',
                'description': 'Доставка еды, бронирование столиков и сертификаты'
            },
            {
                'name': 'Развлечения',
                'slug': 'razvlecheniya',
                'icon': 'Ticket',
                'description': 'Кино, театры, концерты, квесты и парки развлечений'
            },
            {
                'name': 'Финансовые услуги',
                'slug': 'finansy',
                'icon': 'CreditCard',
                'description': 'Кредитные карты, займы, инвестиции и страхование'
            },
            {
                'name': 'Ремонт и строительство',
                'slug': 'remont-stroitelstvo',
                'icon': 'Hammer',
                'description': 'Стройматериалы, инструменты, сантехника и электрика'
            },
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'+ Категория: {category.name}')

        # Магазины с полными данными (2-4 на категорию, ~40 магазинов)
        stores_data = [
            # Электроника
            {'name': 'М.Видео', 'slug': 'mvideo', 'rating': 4.6, 'description': 'Крупнейшая сеть магазинов электроники и бытовой техники', 'site_url': 'https://mvideo.ru', 'category': 'elektronika'},
            {'name': 'DNS', 'slug': 'dns-shop', 'rating': 4.5, 'description': 'Цифровая и бытовая техника по доступным ценам', 'site_url': 'https://dns-shop.ru', 'category': 'elektronika'},
            {'name': 'Ситилинк', 'slug': 'citilink', 'rating': 4.4, 'description': 'Компьютеры, комплектующие и электроника', 'site_url': 'https://citilink.ru', 'category': 'elektronika'},
            {'name': 'Эльдорадо', 'slug': 'eldorado', 'rating': 4.3, 'description': 'Бытовая техника и электроника для дома', 'site_url': 'https://eldorado.ru', 'category': 'elektronika'},

            # Одежда и обувь
            {'name': 'Lamoda', 'slug': 'lamoda', 'rating': 4.7, 'description': 'Модная одежда, обувь и аксессуары мировых брендов', 'site_url': 'https://lamoda.ru', 'category': 'odezhda-obuv'},
            {'name': 'Wildberries', 'slug': 'wildberries', 'rating': 4.6, 'description': 'Крупнейший интернет-магазин одежды и товаров', 'site_url': 'https://wildberries.ru', 'category': 'odezhda-obuv'},
            {'name': 'Ozon Fashion', 'slug': 'ozon-fashion', 'rating': 4.5, 'description': 'Стильная одежда и обувь на любой вкус', 'site_url': 'https://ozon.ru/fashion', 'category': 'odezhda-obuv'},

            # Красота и здоровье
            {'name': 'Золотое Яблоко', 'slug': 'zolotoe-yabloko', 'rating': 4.8, 'description': 'Парфюмерия и косметика премиум-брендов', 'site_url': 'https://goldapple.ru', 'category': 'krasota-zdorovie'},
            {'name': 'Летуаль', 'slug': 'letual', 'rating': 4.6, 'description': 'Косметика, парфюмерия и средства по уходу', 'site_url': 'https://letu.ru', 'category': 'krasota-zdorovie'},
            {'name': 'Рив Гош', 'slug': 'riv-gosh', 'rating': 4.5, 'description': 'Французская парфюмерия и косметика', 'site_url': 'https://rivegauche.ru', 'category': 'krasota-zdorovie'},

            # Дом и интерьер
            {'name': 'IKEA', 'slug': 'ikea', 'rating': 4.7, 'description': 'Мебель и товары для дома шведского качества', 'site_url': 'https://ikea.com/ru', 'category': 'dom-interer'},
            {'name': 'Hoff', 'slug': 'hoff', 'rating': 4.5, 'description': 'Мебель и предметы интерьера', 'site_url': 'https://hoff.ru', 'category': 'dom-interer'},
            {'name': 'Леруа Мерлен', 'slug': 'lerua-merlen', 'rating': 4.6, 'description': 'Товары для ремонта и обустройства дома', 'site_url': 'https://leroymerlin.ru', 'category': 'dom-interer'},

            # Спорт и отдых
            {'name': 'Декатлон', 'slug': 'decathlon', 'rating': 4.7, 'description': 'Спортивные товары для всех видов спорта', 'site_url': 'https://decathlon.ru', 'category': 'sport-otdyh'},
            {'name': 'Спортмастер', 'slug': 'sportmaster', 'rating': 4.6, 'description': 'Экипировка и снаряжение для спорта', 'site_url': 'https://sportmaster.ru', 'category': 'sport-otdyh'},
            {'name': 'Кант', 'slug': 'kant', 'rating': 4.5, 'description': 'Товары для горных лыж, туризма и outdoor', 'site_url': 'https://kant.ru', 'category': 'sport-otdyh'},

            # Детские товары
            {'name': 'Детский мир', 'slug': 'detskiy-mir', 'rating': 4.7, 'description': 'Всё для детей от рождения до школы', 'site_url': 'https://detmir.ru', 'category': 'detskie-tovary'},
            {'name': 'Дочки-Сыночки', 'slug': 'dochki-synochki', 'rating': 4.6, 'description': 'Детские товары, игрушки и одежда', 'site_url': 'https://ds-market.ru', 'category': 'detskie-tovary'},
            {'name': 'Mothercare', 'slug': 'mothercare', 'rating': 4.5, 'description': 'Британский бренд товаров для мам и малышей', 'site_url': 'https://mothercare.ru', 'category': 'detskie-tovary'},

            # Продукты питания
            {'name': 'Яндекс Лавка', 'slug': 'yandex-lavka', 'rating': 4.6, 'description': 'Быстрая доставка продуктов за 15 минут', 'site_url': 'https://lavka.yandex.ru', 'category': 'produkty'},
            {'name': 'СберМаркет', 'slug': 'sbermarket', 'rating': 4.5, 'description': 'Доставка продуктов из любимых магазинов', 'site_url': 'https://sbermarket.ru', 'category': 'produkty'},
            {'name': 'ВкусВилл', 'slug': 'vkusvill', 'rating': 4.7, 'description': 'Натуральные продукты без химии', 'site_url': 'https://vkusvill.ru', 'category': 'produkty'},

            # Бытовая техника
            {'name': 'Технопарк', 'slug': 'tehnopark', 'rating': 4.5, 'description': 'Техника для дома и офиса', 'site_url': 'https://technopark.ru', 'category': 'bytovaya-tehnika'},
            {'name': 'Позитроника', 'slug': 'pozitronika', 'rating': 4.4, 'description': 'Бытовая техника и электроника', 'site_url': 'https://pozitronika.ru', 'category': 'bytovaya-tehnika'},

            # Книги и образование
            {'name': 'Лабиринт', 'slug': 'labirint', 'rating': 4.8, 'description': 'Крупнейший книжный интернет-магазин', 'site_url': 'https://labirint.ru', 'category': 'knigi-obrazovanie'},
            {'name': 'Читай-город', 'slug': 'chitay-gorod', 'rating': 4.6, 'description': 'Книги, канцтовары и подарки', 'site_url': 'https://chitai-gorod.ru', 'category': 'knigi-obrazovanie'},
            {'name': 'Skillbox', 'slug': 'skillbox', 'rating': 4.7, 'description': 'Онлайн-университет для карьеры', 'site_url': 'https://skillbox.ru', 'category': 'knigi-obrazovanie'},

            # Авто и мото
            {'name': 'Автодок', 'slug': 'avtodok', 'rating': 4.5, 'description': 'Запчасти и аксессуары для авто', 'site_url': 'https://autodoc.ru', 'category': 'avto-moto'},
            {'name': 'Exist.ru', 'slug': 'exist', 'rating': 4.6, 'description': 'Автозапчасти с доставкой', 'site_url': 'https://exist.ru', 'category': 'avto-moto'},

            # Путешествия
            {'name': 'Aviasales', 'slug': 'aviasales', 'rating': 4.7, 'description': 'Поиск дешевых авиабилетов', 'site_url': 'https://aviasales.ru', 'category': 'puteshestviya'},
            {'name': 'Booking.com', 'slug': 'booking', 'rating': 4.8, 'description': 'Бронирование отелей по всему миру', 'site_url': 'https://booking.com', 'category': 'puteshestviya'},
            {'name': 'Туту.ру', 'slug': 'tutu', 'rating': 4.6, 'description': 'Билеты на поезда и автобусы', 'site_url': 'https://tutu.ru', 'category': 'puteshestviya'},

            # Рестораны и кафе
            {'name': 'Яндекс Еда', 'slug': 'yandex-eda', 'rating': 4.5, 'description': 'Доставка еды из ресторанов', 'site_url': 'https://eda.yandex.ru', 'category': 'restorany-kafe'},
            {'name': 'Delivery Club', 'slug': 'delivery-club', 'rating': 4.4, 'description': 'Доставка еды из любимых ресторанов', 'site_url': 'https://delivery-club.ru', 'category': 'restorany-kafe'},

            # Развлечения
            {'name': 'Кинопоиск', 'slug': 'kinopoisk', 'rating': 4.7, 'description': 'Подписка на фильмы и сериалы', 'site_url': 'https://kinopoisk.ru', 'category': 'razvlecheniya'},
            {'name': 'Kassir.ru', 'slug': 'kassir', 'rating': 4.6, 'description': 'Билеты на концерты, театры и события', 'site_url': 'https://kassir.ru', 'category': 'razvlecheniya'},

            # Финансовые услуги
            {'name': 'Тинькофф', 'slug': 'tinkoff', 'rating': 4.7, 'description': 'Банковские карты и финансовые услуги', 'site_url': 'https://tinkoff.ru', 'category': 'finansy'},
            {'name': 'Альфа-Банк', 'slug': 'alfabank', 'rating': 4.6, 'description': 'Кредитные карты с кэшбэком', 'site_url': 'https://alfabank.ru', 'category': 'finansy'},

            # Ремонт и строительство
            {'name': 'Петрович', 'slug': 'petrovich', 'rating': 4.6, 'description': 'Стройматериалы с доставкой', 'site_url': 'https://petrovich.ru', 'category': 'remont-stroitelstvo'},
            {'name': 'OBI', 'slug': 'obi', 'rating': 4.5, 'description': 'Гипермаркет товаров для дома и дачи', 'site_url': 'https://obi.ru', 'category': 'remont-stroitelstvo'},
        ]

        stores = {}
        for store_data in stores_data:
            store, created = Store.objects.get_or_create(
                slug=store_data['slug'],
                defaults={
                    'name': store_data['name'],
                    'rating': store_data['rating'],
                    'description': store_data['description'],
                    'site_url': store_data['site_url'],
                }
            )
            stores[store_data['slug']] = store
            if created:
                self.stdout.write(f'  + Магазин: {store.name}')

        # Промокоды (3-5 на магазин)
        promo_templates = [
            {
                'title_template': 'Скидка {discount}% на {product}',
                'description_template': 'Большая скидка на {product}. Успейте воспользоваться выгодным предложением!',
                'discount_range': (15, 50),
                'products': ['первый заказ', 'всё', 'новинки', 'хиты продаж', 'популярные товары'],
                'steps': '1. Добавьте товары в корзину\n2. Перейдите к оформлению заказа\n3. Введите промокод в специальное поле\n4. Скидка применится автоматически',
                'fine_print': 'Промокод действует на товары, участвующие в акции. Не суммируется с другими скидками.',
            },
            {
                'title_template': 'Бесплатная доставка от {amount} руб',
                'description_template': 'Закажите на сумму от {amount} рублей и получите бесплатную доставку',
                'amounts': [1000, 1500, 2000, 2500, 3000],
                'steps': '1. Добавьте товары на нужную сумму\n2. При оформлении выберите доставку\n3. Введите промокод\n4. Стоимость доставки станет 0 руб',
                'fine_print': 'Акция распространяется на доставку курьером и в пункты выдачи.',
            },
            {
                'title_template': 'Кэшбэк {cashback}% бонусами',
                'description_template': 'Получите {cashback}% от суммы заказа бонусами на счёт',
                'cashback_range': (5, 20),
                'steps': '1. Совершите покупку\n2. Активируйте промокод в личном кабинете\n3. Бонусы зачислятся в течение 3 дней\n4. Используйте бонусы в следующем заказе',
                'fine_print': 'Максимальная сумма кэшбэка - 5000 рублей. Бонусы действительны 90 дней.',
            },
            {
                'title_template': 'Подарок к заказу от {amount} руб',
                'description_template': 'При заказе от {amount} рублей получите подарок',
                'amounts': [2000, 3000, 5000],
                'steps': '1. Добавьте товары на нужную сумму\n2. Введите промокод при оформлении\n3. Подарок автоматически добавится в заказ\n4. Получите заказ с подарком',
                'fine_print': 'Подарок выбирается автоматически из доступного ассортимента. Количество подарков ограничено.',
            },
        ]

        offer_types = ['coupon', 'deal', 'cashback']
        promo_count = 0

        for store_slug, store in stores.items():
            # 3-5 промокодов на магазин
            num_promos = random.randint(3, 5)

            for i in range(num_promos):
                template = random.choice(promo_templates)
                offer_type = random.choice(offer_types)

                # Генерируем данные на основе шаблона
                if 'discount_range' in template:
                    discount = random.randint(*template['discount_range'])
                    product = random.choice(template['products'])
                    title = template['title_template'].format(discount=discount, product=product)
                    description = template['description_template'].format(product=product)
                    discount_label = f'Скидка {discount}%'
                    code = f'SALE{discount}{random.randint(100, 999)}'
                    discount_value = discount

                elif 'amounts' in template:
                    amount = random.choice(template['amounts'])
                    title = template['title_template'].format(amount=amount)
                    description = template['description_template'].format(amount=amount)
                    discount_label = template['title_template'].format(amount=amount)
                    code = f'FREE{amount}'
                    discount_value = 0

                elif 'cashback_range' in template:
                    cashback = random.randint(*template['cashback_range'])
                    title = template['title_template'].format(cashback=cashback)
                    description = template['description_template'].format(cashback=cashback)
                    discount_label = f'Кэшбэк {cashback}%'
                    code = f'CASH{cashback}{random.randint(10, 99)}'
                    discount_value = cashback
                    offer_type = 'cashback'

                # Случайные флаги
                is_hot = random.choice([True, False, False])  # 33% шанс
                is_recommended = random.choice([True, False, False, False])  # 25% шанс

                # Срок действия: от 7 до 60 дней
                expires_days = random.randint(7, 60)
                expires_at = timezone.now() + timedelta(days=expires_days)

                # Дисклеймеры в зависимости от типа
                if offer_type == 'financial':
                    disclaimer = 'Финансовая услуга предоставляется партнёром. Возможны ограничения.'
                elif offer_type == 'cashback':
                    disclaimer = 'Условия начисления кэшбэка уточняйте на сайте партнёра.'
                else:
                    disclaimer = ''

                # Long description
                long_description = f"{description}\n\nВоспользуйтесь этим предложением прямо сейчас! Предложение действует до {expires_at.strftime('%d.%m.%Y')}."

                promo, created = PromoCode.objects.get_or_create(
                    title=title,
                    store=store,
                    defaults={
                        'description': description,
                        'long_description': long_description,
                        'code': code,
                        'discount_value': discount_value,
                        'discount_label': discount_label,
                        'is_hot': is_hot,
                        'is_recommended': is_recommended,
                        'offer_type': offer_type,
                        'expires_at': expires_at,
                        'views_count': random.randint(50, 500),
                        'affiliate_url': f"{store.site_url}?utm_source=boltpromo&utm_campaign=promo_{promo_count}",
                        'steps': template.get('steps', ''),
                        'fine_print': template.get('fine_print', ''),
                        'disclaimer': disclaimer,
                    }
                )

                if created:
                    # Находим категорию магазина и добавляем промокод в неё
                    store_category_slug = None
                    for s_data in stores_data:
                        if s_data['slug'] == store_slug:
                            store_category_slug = s_data['category']
                            break

                    if store_category_slug and store_category_slug in categories:
                        promo.categories.add(categories[store_category_slug])

                    promo_count += 1

                    hot_badge = '[HOT]' if is_hot else ''
                    rec_badge = '[REC]' if is_recommended else ''
                    self.stdout.write(f'    + {hot_badge}{rec_badge} {promo.title} ({offer_type})')

        self.stdout.write(
            self.style.SUCCESS(f'\n=== Успешно создано:')
        )
        self.stdout.write(f'   Категорий: {len(categories)}')
        self.stdout.write(f'   Магазинов: {len(stores)}')
        self.stdout.write(f'   Промокодов: {promo_count}')
        self.stdout.write(
            self.style.SUCCESS('\nТестовые данные готовы! Обновите страницу фронтенда.')
        )
