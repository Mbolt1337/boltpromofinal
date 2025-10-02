from django.db import models
from django.utils import timezone
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Описание')
    icon = models.CharField(max_length=50, blank=True, verbose_name='Иконка (Lucide)')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name
    
    @property
    def promocodes_count(self):
        """Количество активных промокодов в категории"""
        return self.promocode_set.filter(
            is_active=True, 
            expires_at__gt=timezone.now()
        ).count()


class Store(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')
    logo = models.ImageField(upload_to='stores/', blank=True, verbose_name='Логотип')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0, verbose_name='Рейтинг')
    description = models.TextField(blank=True, verbose_name='Описание')
    site_url = models.URLField(verbose_name='Сайт магазина')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Магазин'
        verbose_name_plural = 'Магазины'
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('store-detail', kwargs={'slug': self.slug})
    
    @property
    def promocodes_count(self):
        """Количество активных промокодов магазина"""
        return self.promocodes.filter(
            is_active=True, 
            expires_at__gt=timezone.now()
        ).count()


class PromoCode(models.Model):
    OFFER_TYPE_CHOICES = [
        ('coupon', 'Промокод'),
        ('deal', 'Скидка'),
        ('financial', 'Финансовая услуга'),
        ('cashback', 'Кэшбэк'),
    ]
    
    title = models.CharField(max_length=200, blank=True, verbose_name='Заголовок')
    description = models.TextField(verbose_name='Описание')
    
    offer_type = models.CharField(
        max_length=20, 
        choices=OFFER_TYPE_CHOICES, 
        default='coupon',
        verbose_name='Тип предложения',
        help_text='Промокод - копируется код, Скидка - прямая ссылка, Финансовая услуга - CTA с дисклеймером, Кэшбэк - бейдж и переход'
    )
    
    code = models.CharField(max_length=50, blank=True, verbose_name='Промокод')
    discount_value = models.PositiveIntegerField(default=0, verbose_name='Размер скидки')
    
    # ИСПРАВЛЕНО: Добавлено отсутствующее поле discount_label
    discount_label = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='Метка скидки',
        help_text='Например: "Скидка 20%", "Бесплатная доставка", "Кэшбэк 5%"'
    )
    
    long_description = models.TextField(
        blank=True,
        verbose_name='Подробное описание',
        help_text='Детальное описание предложения для модального окна'
    )
    
    steps = models.TextField(
        blank=True,
        verbose_name='Шаги активации',
        help_text='Пошаговая инструкция по использованию (каждый шаг с новой строки или JSON)'
    )
    
    fine_print = models.TextField(
        blank=True,
        verbose_name='Условия использования',
        help_text='Мелкий шрифт - ограничения и условия'
    )
    
    disclaimer = models.TextField(
        blank=True,
        verbose_name='Дисклеймер',
        help_text='Правовая информация (особенно для финансовых услуг)'
    )
    
    is_hot = models.BooleanField(default=False, verbose_name='Горячее предложение')
    is_recommended = models.BooleanField(
        default=False, 
        verbose_name='BoltPromo рекомендует',
        help_text='Отметить как рекомендуемый промокод (показывается с особым бейджем)'
    )
    
    expires_at = models.DateTimeField(verbose_name='Действует до')
    
    # ИСПРАВЛЕНО: Переименовано views -> views_count для соответствия с API
    views_count = models.PositiveIntegerField(default=0, verbose_name='Просмотры')
    
    affiliate_url = models.URLField(blank=True, verbose_name='Партнерская ссылка')
    
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='promocodes', verbose_name='Магазин')
    categories = models.ManyToManyField(Category, blank=True, verbose_name='Категории')
    
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Промокод'
        verbose_name_plural = 'Промокоды'
        ordering = ['-is_recommended', '-is_hot', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.store.name}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    # ИСПРАВЛЕНО: Метод обновляет правильное поле
    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    # ДОБАВЛЕНО: Свойство для обратной совместимости с старым API
    @property
    def views(self):
        return self.views_count
    
    @property
    def is_coupon(self):
        return self.offer_type == 'coupon'
    
    @property
    def is_deal(self):
        return self.offer_type == 'deal'
    
    @property
    def is_financial(self):
        return self.offer_type == 'financial'
    
    @property
    def is_cashback(self):
        return self.offer_type == 'cashback'
    
    @property
    def has_promocode(self):
        """Проверяем, есть ли промокод для копирования"""
        return bool(self.code) and self.offer_type == 'coupon'
    
    # ДОБАВЛЕНО: Автоматическое формирование discount_label
    def save(self, *args, **kwargs):
        if not self.discount_label and self.discount_value:
            if self.offer_type == 'cashback':
                self.discount_label = f"Кэшбэк {self.discount_value}%"
            else:
                self.discount_label = f"Скидка {self.discount_value}%"
        super().save(*args, **kwargs)


class Banner(models.Model):
    title = models.CharField(max_length=200, blank=True, verbose_name='Заголовок')
    subtitle = models.CharField(max_length=300, blank=True, verbose_name='Подзаголовок')
    image = models.ImageField(upload_to='banners/', verbose_name='Изображение')
    cta_text = models.CharField(max_length=50, blank=True, default='Подробнее', verbose_name='Текст кнопки')
    cta_url = models.URLField(verbose_name='Ссылка')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортировки')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Баннер'
        verbose_name_plural = 'Баннеры'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title


class Partner(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    logo = models.ImageField(upload_to='partners/', verbose_name='Логотип')
    url = models.URLField(blank=True, verbose_name='Сайт партнера')
    order = models.PositiveIntegerField(default=0, verbose_name='Порядок')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Партнер'
        verbose_name_plural = 'Партнеры'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class StaticPage(models.Model):
    SLUG_CHOICES = [
        ('faq', 'FAQ'),
        ('privacy', 'Политика конфиденциальности'),
        ('terms', 'Пользовательское соглашение'),
        ('about', 'О проекте'),
    ]
    
    slug = models.CharField(max_length=20, choices=SLUG_CHOICES, unique=True, verbose_name='URL')
    title = models.CharField(max_length=200, blank=True, verbose_name='Заголовок')
    content = models.TextField(verbose_name='Содержимое')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Статичная страница'
        verbose_name_plural = 'Статичные страницы'

    def __str__(self):
        return self.get_slug_display()


class ContactMessage(models.Model):
    """Модель для сохранения сообщений из формы обратной связи"""
    name = models.CharField(max_length=100, verbose_name='Имя')
    email = models.EmailField(verbose_name='Email')
    subject = models.CharField(max_length=200, verbose_name='Тема', blank=True)
    message = models.TextField(verbose_name='Сообщение')
    
    page = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name='Страница отправки',
        help_text='С какой страницы отправлено сообщение'
    )
    user_agent = models.TextField(
        blank=True, 
        verbose_name='User Agent',
        help_text='Информация о браузере пользователя'
    )
    ip_address = models.GenericIPAddressField(
        blank=True, 
        null=True, 
        verbose_name='IP адрес'
    )
    
    is_processed = models.BooleanField(
        default=False, 
        verbose_name='Обработано',
        help_text='Отметьте, когда ответите на сообщение'
    )
    is_spam = models.BooleanField(
        default=False, 
        verbose_name='Спам',
        help_text='Отметить как спам'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    processed_at = models.DateTimeField(
        blank=True, 
        null=True, 
        verbose_name='Дата обработки'
    )

    class Meta:
        verbose_name = 'Сообщение обратной связи'
        verbose_name_plural = 'Сообщения обратной связи'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.created_at.strftime('%d.%m.%Y %H:%M')}"

    def save(self, *args, **kwargs):
        if self.is_processed and not self.processed_at:
            self.processed_at = timezone.now()
        elif not self.is_processed and self.processed_at:
            self.processed_at = None
        super().save(*args, **kwargs)

    @property
    def short_message(self):
        """Сокращенная версия сообщения для списка в админке"""
        if len(self.message) > 100:
            return f"{self.message[:100]}..."
        return self.message


class Showcase(models.Model):
    """Модель витрины (подборки) промокодов"""
    title = models.CharField(max_length=200, verbose_name='Название')
    slug = models.SlugField(max_length=220, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='Описание')
    banner = models.ImageField(upload_to='showcases/', verbose_name='Баннер')
    is_active = models.BooleanField(default=True, verbose_name='Активна')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='Порядок сортировки')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Витрина'
        verbose_name_plural = 'Витрины'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('showcase-detail', kwargs={'slug': self.slug})


class ShowcaseItem(models.Model):
    """Связующая модель между витриной и промокодом с порядком сортировки"""
    showcase = models.ForeignKey(
        Showcase,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Витрина'
    )
    promocode = models.ForeignKey(
        PromoCode,
        on_delete=models.CASCADE,
        related_name='showcase_items',
        verbose_name='Промокод'
    )
    position = models.PositiveIntegerField(default=0, verbose_name='Позиция')

    class Meta:
        verbose_name = 'Элемент витрины'
        verbose_name_plural = 'Элементы витрины'
        unique_together = ('showcase', 'promocode')
        ordering = ['position', 'id']

    def __str__(self):
        return f"{self.showcase.title} - {self.promocode.title}"


class SiteSettings(models.Model):
    """Централизованные настройки сайта (singleton)"""
    singleton_id = models.PositiveSmallIntegerField(default=1, unique=True, editable=False)

    # Maintenance
    maintenance_enabled = models.BooleanField(default=False, verbose_name="Включить режим техработ")
    maintenance_message = models.TextField(blank=True, default="", verbose_name="Сообщение пользователю")
    maintenance_expected_end = models.DateTimeField(blank=True, null=True, verbose_name="Ожидаемое завершение работ")
    maintenance_telegram_url = models.URLField(blank=True, default="", verbose_name="Ссылка на Telegram")
    maintenance_ip_whitelist = models.JSONField(default=list, blank=True, verbose_name="Белый список IP")

    # SEO
    canonical_host = models.CharField(max_length=255, blank=True, default="", verbose_name="Канонический домен (пример: boltpromo.ru)")
    robots_txt = models.TextField(blank=True, default="", verbose_name="robots.txt (кастом)")
    noindex_expired_promos = models.BooleanField(default=True, verbose_name="noindex для просроченных промо")

    # Cache
    allow_admin_cache_flush = models.BooleanField(default=True, verbose_name="Разрешить сброс кэша из админки")

    def save(self, *args, **kwargs):
        self.singleton_id = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Настройки сайта"

    class Meta:
        verbose_name = "Настройки сайта"
        verbose_name_plural = "Настройки сайта"


class AdminActionLog(models.Model):
    """Лог действий администратора"""
    user = models.CharField(max_length=150, verbose_name="Пользователь")
    action = models.CharField(max_length=100, verbose_name="Действие")
    details = models.TextField(blank=True, default="", verbose_name="Детали")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата")

    class Meta:
        verbose_name = "Лог действий админа"
        verbose_name_plural = "Логи действий админов"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.action} - {self.created_at.strftime('%d.%m.%Y %H:%M')}"


class SiteAssets(models.Model):
    """Медиа-ресурсы сайта (favicon, OG, PWA иконки) - singleton"""
    singleton_id = models.PositiveSmallIntegerField(default=1, unique=True, editable=False)

    # Исходные файлы
    favicon_src = models.ImageField(
        upload_to='site_assets/favicon/',
        blank=True,
        null=True,
        verbose_name="Favicon (исходник)",
        help_text="PNG/ICO, рекомендуется 512×512px (будет конвертирован в .ico)"
    )

    og_default = models.ImageField(
        upload_to='site_assets/og/',
        blank=True,
        null=True,
        verbose_name="OG изображение по умолчанию",
        help_text="1200×630px для Open Graph"
    )

    twitter_default = models.ImageField(
        upload_to='site_assets/twitter/',
        blank=True,
        null=True,
        verbose_name="Twitter Card изображение",
        help_text="1200×600px (опционально, если отличается от OG)"
    )

    apple_touch_icon_src = models.ImageField(
        upload_to='site_assets/apple/',
        blank=True,
        null=True,
        verbose_name="Apple Touch Icon (исходник)",
        help_text="PNG, рекомендуется 180×180px или больше"
    )

    pwa_icon_src = models.ImageField(
        upload_to='site_assets/pwa/',
        blank=True,
        null=True,
        verbose_name="PWA иконка (исходник)",
        help_text="PNG, рекомендуется 512×512px (будут созданы 192, 512, maskable)"
    )

    safari_pinned_svg = models.FileField(
        upload_to='site_assets/safari/',
        blank=True,
        null=True,
        verbose_name="Safari Pinned Tab SVG",
        help_text="Монохромный SVG для Safari"
    )

    # Цвета PWA
    theme_color = models.CharField(
        max_length=7,
        default="#0b1020",
        verbose_name="Theme Color",
        help_text="Цвет темы браузера (hex формат)"
    )

    background_color = models.CharField(
        max_length=7,
        default="#0b1020",
        verbose_name="Background Color",
        help_text="Фоновый цвет для splash screen"
    )

    # Сгенерированные файлы (пути)
    favicon_ico_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к favicon.ico")
    favicon_16_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к favicon-16.png")
    favicon_32_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к favicon-32.png")
    apple_touch_icon_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к apple-touch-icon.png")
    pwa_192_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к icon-192.png")
    pwa_512_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к icon-512.png")
    pwa_maskable_path = models.CharField(max_length=255, blank=True, verbose_name="Путь к maskable-icon-512.png")

    # Метаданные
    last_generated_at = models.DateTimeField(blank=True, null=True, verbose_name="Последняя генерация")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")

    def save(self, *args, **kwargs):
        self.singleton_id = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return "Медиа-ресурсы сайта"

    class Meta:
        verbose_name = "Медиа-ресурсы сайта"
        verbose_name_plural = "Медиа-ресурсы сайта"


class Event(models.Model):
    """Событие трекинга"""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    event_type = models.CharField(max_length=40, db_index=True, verbose_name="Тип события")
    # Типы: 'promo_view','promo_copy','promo_open','finance_open','deal_open','showcase_view','showcase_open'

    promo = models.ForeignKey('PromoCode', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Промокод")
    store = models.ForeignKey('Store', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Магазин")
    showcase = models.ForeignKey('Showcase', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Витрина")

    session_id = models.CharField(max_length=64, blank=True, default="", verbose_name="ID сессии")
    client_ip = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP")
    user_agent = models.TextField(blank=True, default="", verbose_name="User Agent")

    ref = models.CharField(max_length=100, blank=True, default="", verbose_name="Реферер")
    utm_source = models.CharField(max_length=100, blank=True, default="", verbose_name="UTM Source")
    utm_medium = models.CharField(max_length=100, blank=True, default="", verbose_name="UTM Medium")
    utm_campaign = models.CharField(max_length=100, blank=True, default="", verbose_name="UTM Campaign")

    is_unique = models.BooleanField(default=False, verbose_name="Уникальное")

    class Meta:
        verbose_name = "Событие"
        verbose_name_plural = "События"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['promo', 'event_type']),
            models.Index(fields=['store', 'event_type']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.created_at.strftime('%d.%m.%Y %H:%M')}"


class DailyAgg(models.Model):
    """Агрегированная статистика по дням"""
    date = models.DateField(db_index=True, verbose_name="Дата")
    event_type = models.CharField(max_length=40, db_index=True, verbose_name="Тип события")

    promo = models.ForeignKey('PromoCode', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Промокод")
    store = models.ForeignKey('Store', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Магазин")
    showcase = models.ForeignKey('Showcase', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Витрина")

    count = models.PositiveIntegerField(default=0, verbose_name="Количество")
    unique_count = models.PositiveIntegerField(default=0, verbose_name="Уникальных")

    class Meta:
        verbose_name = "Агрегат по дням"
        verbose_name_plural = "Агрегаты по дням"
        unique_together = [('date', 'event_type', 'promo', 'store', 'showcase')]
        indexes = [
            models.Index(fields=['date', 'event_type']),
        ]

    def __str__(self):
        return f"{self.date} - {self.event_type} - {self.count}"