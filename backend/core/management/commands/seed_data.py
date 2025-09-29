from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import Category, Store, PromoCode, Banner, StaticPage


class Command(BaseCommand):
    help = 'Создает тестовые данные для BoltPromo'

    def handle(self, *args, **options):
        self.stdout.write('Создание тестовых данных...')

        # Создание категорий
        categories_data = [
            {'name': 'Технологии', 'slug': 'tehnologii', 'icon': 'Smartphone'},
            {'name': 'Одежда', 'slug': 'odezhda', 'icon': 'ShirtIcon'},
            {'name': 'Дом и сад', 'slug': 'dom-i-sad', 'icon': 'Home'},
            {'name': 'Спорт', 'slug': 'sport', 'icon': 'Dumbbell'},
            {'name': 'Красота', 'slug': 'krasota', 'icon': 'Sparkles'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'Создана категория: {category.name}')

        # Создание магазинов
        stores_data = [
            {'name': 'Ozon', 'slug': 'ozon', 'rating': 4.7, 'description': 'Крупнейший интернет-магазин', 'site_url': 'https://ozon.ru'},
            {'name': 'Wildberries', 'slug': 'wildberries', 'rating': 4.5, 'description': 'Маркетплейс одежды и товаров', 'site_url': 'https://wildberries.ru'},
            {'name': 'AliExpress', 'slug': 'aliexpress', 'rating': 4.3, 'description': 'Товары из Китая', 'site_url': 'https://aliexpress.ru'},
            {'name': 'Lamoda', 'slug': 'lamoda', 'rating': 4.6, 'description': 'Модная одежда и обувь', 'site_url': 'https://lamoda.ru'},
            {'name': 'М.Видео', 'slug': 'mvideo', 'rating': 4.4, 'description': 'Бытовая техника и электроника', 'site_url': 'https://mvideo.ru'},
        ]

        stores = {}
        for store_data in stores_data:
            store, created = Store.objects.get_or_create(
                slug=store_data['slug'],
                defaults=store_data
            )
            stores[store_data['slug']] = store
            if created:
                self.stdout.write(f'Создан магазин: {store.name}')

        # Создание промокодов
        promocodes_data = [
            {
                'title': 'Скидка 25% на технику',
                'description': 'Большая скидка на смартфоны, ноутбуки и планшеты',
                'code': 'TECH25',
                'discount_value': 25,
                'discount_label': 'Скидка 25%',
                'is_hot': True,
                'store': 'ozon',
                'categories': ['tehnologii'],
                'affiliate_url': 'https://ozon.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_1'
            },
            {
                'title': 'Бесплатная доставка',
                'description': 'Бесплатная доставка при заказе от 1000 рублей',
                'code': 'FREESHIP',
                'discount_value': 0,
                'discount_label': 'Бесплатная доставка',
                'is_hot': False,
                'store': 'wildberries',
                'categories': ['odezhda'],
                'affiliate_url': 'https://wildberries.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_2'
            },
            {
                'title': 'Скидка 40% на первый заказ',
                'description': 'Максимальная скидка для новых покупателей',
                'code': 'NEWBIE40',
                'discount_value': 40,
                'discount_label': 'Скидка 40%',
                'is_hot': True,
                'store': 'aliexpress',
                'categories': ['tehnologii', 'dom-i-sad'],
                'affiliate_url': 'https://aliexpress.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_3'
            },
            {
                'title': 'Скидка 30% на обувь',
                'description': 'Женская и мужская обувь по выгодным ценам',
                'code': 'SHOES30',
                'discount_value': 30,
                'discount_label': 'Скидка 30%',
                'is_hot': False,
                'store': 'lamoda',
                'categories': ['odezhda'],
                'affiliate_url': 'https://lamoda.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_4'
            },
            {
                'title': 'Распродажа техники до 50%',
                'description': 'Телевизоры, холодильники, стиральные машины',
                'code': '',
                'discount_value': 50,
                'discount_label': 'До 50%',
                'is_hot': True,
                'store': 'mvideo',
                'categories': ['tehnologii'],
                'affiliate_url': 'https://mvideo.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_5'
            },
            {
                'title': 'Скидка 20% на косметику',
                'description': 'Уход за лицом, макияж, парфюмерия',
                'code': 'BEAUTY20',
                'discount_value': 20,
                'discount_label': 'Скидка 20%',
                'is_hot': False,
                'store': 'wildberries',
                'categories': ['krasota'],
                'affiliate_url': 'https://wildberries.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_6'
            },
            {
                'title': 'Спортивная экипировка -35%',
                'description': 'Одежда для фитнеса, кроссовки, спортивный инвентарь',
                'code': 'SPORT35',
                'discount_value': 35,
                'discount_label': 'Скидка 35%',
                'is_hot': True,
                'store': 'ozon',
                'categories': ['sport', 'odezhda'],
                'affiliate_url': 'https://ozon.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_7'
            },
            {
                'title': 'Товары для дома -25%',
                'description': 'Мебель, декор, кухонные принадлежности',
                'code': 'HOME25',
                'discount_value': 25,
                'discount_label': 'Скидка 25%',
                'is_hot': False,
                'store': 'ozon',
                'categories': ['dom-i-sad'],
                'affiliate_url': 'https://ozon.ru/?utm_source=boltpromo&utm_medium=site&utm_campaign=promo_8'
            },
        ]

        for i, promo_data in enumerate(promocodes_data, 1):
            expires_at = timezone.now() + timedelta(days=30)
            
            promo, created = PromoCode.objects.get_or_create(
                title=promo_data['title'],
                defaults={
                    'description': promo_data['description'],
                    'code': promo_data['code'],
                    'discount_value': promo_data['discount_value'],
                    'discount_label': promo_data['discount_label'],
                    'is_hot': promo_data['is_hot'],
                    'expires_at': expires_at,
                    'views_count': 100 + i * 50,
                    'affiliate_url': promo_data['affiliate_url'],
                    'store': stores[promo_data['store']],
                }
            )
            
            if created:
                # Добавляем категории
                for cat_slug in promo_data['categories']:
                    promo.categories.add(categories[cat_slug])
                
                self.stdout.write(f'Создан промокод: {promo.title}')

        # Создание баннеров
        banners_data = [
            {
                'title': 'Летняя распродажа',
                'subtitle': 'Скидки до 70% на летние товары',
                'cta_text': 'Смотреть все',
                'cta_url': 'https://ozon.ru/summer-sale',
                'sort_order': 1
            },
            {
                'title': 'Новинки техники',
                'subtitle': 'Последние модели смартфонов и ноутбуков',
                'cta_text': 'Подробнее',
                'cta_url': 'https://mvideo.ru/new',
                'sort_order': 2
            },
            {
                'title': 'Мода осень-зима',
                'subtitle': 'Новая коллекция одежды и обуви',
                'cta_text': 'В каталог',
                'cta_url': 'https://lamoda.ru/autumn',
                'sort_order': 3
            },
        ]

        for banner_data in banners_data:
            banner, created = Banner.objects.get_or_create(
                title=banner_data['title'],
                defaults=banner_data
            )
            if created:
                self.stdout.write(f'Создан баннер: {banner.title}')

        # Создание статических страниц
        pages_data = [
            {
                'slug': 'faq',
                'title': 'Часто задаваемые вопросы',
                'content': '''
                <h2>Как пользоваться промокодами?</h2>
                <p>Скопируйте промокод и вставьте его в соответствующее поле при оформлении заказа в интернет-магазине.</p>
                
                <h2>Почему промокод не работает?</h2>
                <p>Возможные причины: истек срок действия, промокод уже использован, не выполнены условия акции.</p>
                
                <h2>Как часто добавляются новые промокоды?</h2>
                <p>Мы обновляем базу промокодов ежедневно и добавляем только актуальные предложения.</p>
                '''
            },
            {
                'slug': 'privacy',
                'title': 'Политика конфиденциальности',
                'content': '''
                <h2>Сбор информации</h2>
                <p>Мы собираем только необходимую информацию для улучшения качества нашего сервиса.</p>
                
                <h2>Использование cookies</h2>
                <p>Сайт использует файлы cookie для аналитики и улучшения пользовательского опыта.</p>
                
                <h2>Контактная информация</h2>
                <p>По вопросам обработки персональных данных обращайтесь на email: support@boltpromo.ru</p>
                '''
            },
            {
                'slug': 'terms',
                'title': 'Пользовательское соглашение',
                'content': '''
                <h2>Общие положения</h2>
                <p>Используя наш сайт, вы соглашаетесь с условиями данного соглашения.</p>
                
                <h2>Ответственность</h2>
                <p>Мы не несем ответственности за действия третьих лиц и работу внешних интернет-магазинов.</p>
                
                <h2>Изменения в соглашении</h2>
                <p>Мы оставляем за собой право изменять условия соглашения без предварительного уведомления.</p>
                '''
            },
        ]

        for page_data in pages_data:
            page, created = StaticPage.objects.get_or_create(
                slug=page_data['slug'],
                defaults=page_data
            )
            if created:
                self.stdout.write(f'Создана страница: {page.title}')

        self.stdout.write(
            self.style.SUCCESS('Тестовые данные успешно созданы!')
        )