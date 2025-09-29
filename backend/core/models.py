from django.db import models
from django.utils import timezone
from django.urls import reverse


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='РќР°Р·РІР°РЅРёРµ')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')
    description = models.TextField(blank=True, verbose_name='РћРїРёСЃР°РЅРёРµ')
    icon = models.CharField(max_length=50, blank=True, verbose_name='РРєРѕРЅРєР° (Lucide)')
    is_active = models.BooleanField(default=True, verbose_name='РђРєС‚РёРІРЅР°')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'РљР°С‚РµРіРѕСЂРёСЏ'
        verbose_name_plural = 'РљР°С‚РµРіРѕСЂРёРё'
        ordering = ['name']

    def __str__(self):
        return self.name
    
    @property
    def promocodes_count(self):
        """РљРѕР»РёС‡РµСЃС‚РІРѕ Р°РєС‚РёРІРЅС‹С… РїСЂРѕРјРѕРєРѕРґРѕРІ РІ РєР°С‚РµРіРѕСЂРёРё"""
        return self.promocode_set.filter(
            is_active=True, 
            expires_at__gt=timezone.now()
        ).count()


class Store(models.Model):
    name = models.CharField(max_length=100, verbose_name='РќР°Р·РІР°РЅРёРµ')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')
    logo = models.ImageField(upload_to='stores/', blank=True, verbose_name='Р›РѕРіРѕС‚РёРї')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0, verbose_name='Р РµР№С‚РёРЅРі')
    description = models.TextField(blank=True, verbose_name='РћРїРёСЃР°РЅРёРµ')
    site_url = models.URLField(verbose_name='РЎР°Р№С‚ РјР°РіР°Р·РёРЅР°')
    is_active = models.BooleanField(default=True, verbose_name='РђРєС‚РёРІРµРЅ')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'РњР°РіР°Р·РёРЅ'
        verbose_name_plural = 'РњР°РіР°Р·РёРЅС‹'
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('store-detail', kwargs={'slug': self.slug})
    
    @property
    def promocodes_count(self):
        """РљРѕР»РёС‡РµСЃС‚РІРѕ Р°РєС‚РёРІРЅС‹С… РїСЂРѕРјРѕРєРѕРґРѕРІ РјР°РіР°Р·РёРЅР°"""
        return self.promocodes.filter(
            is_active=True, 
            expires_at__gt=timezone.now()
        ).count()


class PromoCode(models.Model):
    OFFER_TYPE_CHOICES = [
        ('coupon', 'РџСЂРѕРјРѕРєРѕРґ'),
        ('deal', 'РЎРєРёРґРєР°'),
        ('financial', 'Р¤РёРЅР°РЅСЃРѕРІР°СЏ СѓСЃР»СѓРіР°'),
        ('cashback', 'РљСЌС€Р±СЌРє'),
    ]
    
    title = models.CharField(max_length=200, blank=True, verbose_name='Р—Р°РіРѕР»РѕРІРѕРє')
    description = models.TextField(verbose_name='РћРїРёСЃР°РЅРёРµ')
    
    offer_type = models.CharField(
        max_length=20, 
        choices=OFFER_TYPE_CHOICES, 
        default='coupon',
        verbose_name='РўРёРї РїСЂРµРґР»РѕР¶РµРЅРёСЏ',
        help_text='РџСЂРѕРјРѕРєРѕРґ - РєРѕРїРёСЂСѓРµС‚СЃСЏ РєРѕРґ, РЎРєРёРґРєР° - РїСЂСЏРјР°СЏ СЃСЃС‹Р»РєР°, Р¤РёРЅР°РЅСЃРѕРІР°СЏ СѓСЃР»СѓРіР° - CTA СЃ РґРёСЃРєР»РµР№РјРµСЂРѕРј, РљСЌС€Р±СЌРє - Р±РµР№РґР¶ Рё РїРµСЂРµС…РѕРґ'
    )
    
    code = models.CharField(max_length=50, blank=True, verbose_name='РџСЂРѕРјРѕРєРѕРґ')
    discount_value = models.PositiveIntegerField(default=0, verbose_name='Р Р°Р·РјРµСЂ СЃРєРёРґРєРё')
    
    # РРЎРџР РђР’Р›Р•РќРћ: Р”РѕР±Р°РІР»РµРЅРѕ РѕС‚СЃСѓС‚СЃС‚РІСѓСЋС‰РµРµ РїРѕР»Рµ discount_label
    discount_label = models.CharField(
        max_length=100, 
        blank=True,
        verbose_name='РњРµС‚РєР° СЃРєРёРґРєРё',
        help_text='РќР°РїСЂРёРјРµСЂ: "РЎРєРёРґРєР° 20%", "Р‘РµСЃРїР»Р°С‚РЅР°СЏ РґРѕСЃС‚Р°РІРєР°", "РљСЌС€Р±СЌРє 5%"'
    )
    
    long_description = models.TextField(
        blank=True,
        verbose_name='РџРѕРґСЂРѕР±РЅРѕРµ РѕРїРёСЃР°РЅРёРµ',
        help_text='Р”РµС‚Р°Р»СЊРЅРѕРµ РѕРїРёСЃР°РЅРёРµ РїСЂРµРґР»РѕР¶РµРЅРёСЏ РґР»СЏ РјРѕРґР°Р»СЊРЅРѕРіРѕ РѕРєРЅР°'
    )
    
    steps = models.TextField(
        blank=True,
        verbose_name='РЁР°РіРё Р°РєС‚РёРІР°С†РёРё',
        help_text='РџРѕС€Р°РіРѕРІР°СЏ РёРЅСЃС‚СЂСѓРєС†РёСЏ РїРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЋ (РєР°Р¶РґС‹Р№ С€Р°Рі СЃ РЅРѕРІРѕР№ СЃС‚СЂРѕРєРё РёР»Рё JSON)'
    )
    
    fine_print = models.TextField(
        blank=True,
        verbose_name='РЈСЃР»РѕРІРёСЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ',
        help_text='РњРµР»РєРёР№ С€СЂРёС„С‚ - РѕРіСЂР°РЅРёС‡РµРЅРёСЏ Рё СѓСЃР»РѕРІРёСЏ'
    )
    
    disclaimer = models.TextField(
        blank=True,
        verbose_name='Р”РёСЃРєР»РµР№РјРµСЂ',
        help_text='РџСЂР°РІРѕРІР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ (РѕСЃРѕР±РµРЅРЅРѕ РґР»СЏ С„РёРЅР°РЅСЃРѕРІС‹С… СѓСЃР»СѓРі)'
    )
    
    is_hot = models.BooleanField(default=False, verbose_name='Р“РѕСЂСЏС‡РµРµ РїСЂРµРґР»РѕР¶РµРЅРёРµ')
    is_recommended = models.BooleanField(
        default=False, 
        verbose_name='BoltPromo СЂРµРєРѕРјРµРЅРґСѓРµС‚',
        help_text='РћС‚РјРµС‚РёС‚СЊ РєР°Рє СЂРµРєРѕРјРµРЅРґСѓРµРјС‹Р№ РїСЂРѕРјРѕРєРѕРґ (РїРѕРєР°Р·С‹РІР°РµС‚СЃСЏ СЃ РѕСЃРѕР±С‹Рј Р±РµР№РґР¶РµРј)'
    )
    
    expires_at = models.DateTimeField(verbose_name='Р”РµР№СЃС‚РІСѓРµС‚ РґРѕ')
    
    # РРЎРџР РђР’Р›Р•РќРћ: РџРµСЂРµРёРјРµРЅРѕРІР°РЅРѕ views -> views_count РґР»СЏ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ СЃ API
    views_count = models.PositiveIntegerField(default=0, verbose_name='РџСЂРѕСЃРјРѕС‚СЂС‹')
    
    affiliate_url = models.URLField(blank=True, verbose_name='РџР°СЂС‚РЅРµСЂСЃРєР°СЏ СЃСЃС‹Р»РєР°')
    
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='promocodes', verbose_name='РњР°РіР°Р·РёРЅ')
    categories = models.ManyToManyField(Category, blank=True, verbose_name='РљР°С‚РµРіРѕСЂРёРё')
    
    is_active = models.BooleanField(default=True, verbose_name='РђРєС‚РёРІРµРЅ')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'РџСЂРѕРјРѕРєРѕРґ'
        verbose_name_plural = 'РџСЂРѕРјРѕРєРѕРґС‹'
        ordering = ['-is_recommended', '-is_hot', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.store.name}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    # РРЎРџР РђР’Р›Р•РќРћ: РњРµС‚РѕРґ РѕР±РЅРѕРІР»СЏРµС‚ РїСЂР°РІРёР»СЊРЅРѕРµ РїРѕР»Рµ
    def increment_views(self):
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    # Р”РћР‘РђР’Р›Р•РќРћ: РЎРІРѕР№СЃС‚РІРѕ РґР»СЏ РѕР±СЂР°С‚РЅРѕР№ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё СЃ СЃС‚Р°СЂС‹Рј API
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
        """РџСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё РїСЂРѕРјРѕРєРѕРґ РґР»СЏ РєРѕРїРёСЂРѕРІР°РЅРёСЏ"""
        return bool(self.code) and self.offer_type == 'coupon'
    
    # Р”РћР‘РђР’Р›Р•РќРћ: РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРѕРµ С„РѕСЂРјРёСЂРѕРІР°РЅРёРµ discount_label
    def save(self, *args, **kwargs):
        if not self.discount_label and self.discount_value:
            if self.offer_type == 'cashback':
                self.discount_label = f"РљСЌС€Р±СЌРє {self.discount_value}%"
            else:
                self.discount_label = f"РЎРєРёРґРєР° {self.discount_value}%"
        super().save(*args, **kwargs)


class Banner(models.Model):
    title = models.CharField(max_length=200, blank=True, verbose_name='Р—Р°РіРѕР»РѕРІРѕРє')
    subtitle = models.CharField(max_length=300, blank=True, verbose_name='РџРѕРґР·Р°РіРѕР»РѕРІРѕРє')
    image = models.ImageField(upload_to='banners/', verbose_name='РР·РѕР±СЂР°Р¶РµРЅРёРµ')
    cta_text = models.CharField(max_length=50, blank=True, default='РџРѕРґСЂРѕР±РЅРµРµ', verbose_name='РўРµРєСЃС‚ РєРЅРѕРїРєРё')
    cta_url = models.URLField(verbose_name='РЎСЃС‹Р»РєР°')
    is_active = models.BooleanField(default=True, verbose_name='РђРєС‚РёРІРµРЅ')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='РџРѕСЂСЏРґРѕРє СЃРѕСЂС‚РёСЂРѕРІРєРё')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Р‘Р°РЅРЅРµСЂ'
        verbose_name_plural = 'Р‘Р°РЅРЅРµСЂС‹'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title


class Partner(models.Model):
    name = models.CharField(max_length=100, verbose_name='РќР°Р·РІР°РЅРёРµ')
    logo = models.ImageField(upload_to='partners/', verbose_name='Р›РѕРіРѕС‚РёРї')
    url = models.URLField(blank=True, verbose_name='РЎР°Р№С‚ РїР°СЂС‚РЅРµСЂР°')
    order = models.PositiveIntegerField(default=0, verbose_name='РџРѕСЂСЏРґРѕРє')
    is_active = models.BooleanField(default=True, verbose_name='РђРєС‚РёРІРµРЅ')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'РџР°СЂС‚РЅРµСЂ'
        verbose_name_plural = 'РџР°СЂС‚РЅРµСЂС‹'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class StaticPage(models.Model):
    SLUG_CHOICES = [
        ('faq', 'FAQ'),
        ('privacy', 'РџРѕР»РёС‚РёРєР° РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё'),
        ('terms', 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРµ СЃРѕРіР»Р°С€РµРЅРёРµ'),
        ('about', 'Рћ РїСЂРѕРµРєС‚Рµ'),
    ]
    
    slug = models.CharField(max_length=20, choices=SLUG_CHOICES, unique=True, verbose_name='URL')
    title = models.CharField(max_length=200, blank=True, verbose_name='Р—Р°РіРѕР»РѕРІРѕРє')
    content = models.TextField(verbose_name='РЎРѕРґРµСЂР¶РёРјРѕРµ')
    is_active = models.BooleanField(default=True, verbose_name='РђРєС‚РёРІРЅР°')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'РЎС‚Р°С‚РёС‡РЅР°СЏ СЃС‚СЂР°РЅРёС†Р°'
        verbose_name_plural = 'РЎС‚Р°С‚РёС‡РЅС‹Рµ СЃС‚СЂР°РЅРёС†С‹'

    def __str__(self):
        return self.get_slug_display()


class ContactMessage(models.Model):
    """РњРѕРґРµР»СЊ РґР»СЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ СЃРѕРѕР±С‰РµРЅРёР№ РёР· С„РѕСЂРјС‹ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё"""
    name = models.CharField(max_length=100, verbose_name='РРјСЏ')
    email = models.EmailField(verbose_name='Email')
    subject = models.CharField(max_length=200, verbose_name='РўРµРјР°', blank=True)
    message = models.TextField(verbose_name='РЎРѕРѕР±С‰РµРЅРёРµ')
    
    page = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name='РЎС‚СЂР°РЅРёС†Р° РѕС‚РїСЂР°РІРєРё',
        help_text='РЎ РєР°РєРѕР№ СЃС‚СЂР°РЅРёС†С‹ РѕС‚РїСЂР°РІР»РµРЅРѕ СЃРѕРѕР±С‰РµРЅРёРµ'
    )
    user_agent = models.TextField(
        blank=True, 
        verbose_name='User Agent',
        help_text='РРЅС„РѕСЂРјР°С†РёСЏ Рѕ Р±СЂР°СѓР·РµСЂРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ'
    )
    ip_address = models.GenericIPAddressField(
        blank=True, 
        null=True, 
        verbose_name='IP Р°РґСЂРµСЃ'
    )
    
    is_processed = models.BooleanField(
        default=False, 
        verbose_name='РћР±СЂР°Р±РѕС‚Р°РЅРѕ',
        help_text='РћС‚РјРµС‚СЊС‚Рµ, РєРѕРіРґР° РѕС‚РІРµС‚РёС‚Рµ РЅР° СЃРѕРѕР±С‰РµРЅРёРµ'
    )
    is_spam = models.BooleanField(
        default=False, 
        verbose_name='РЎРїР°Рј',
        help_text='РћС‚РјРµС‚РёС‚СЊ РєР°Рє СЃРїР°Рј'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Р”Р°С‚Р° СЃРѕР·РґР°РЅРёСЏ')
    processed_at = models.DateTimeField(
        blank=True, 
        null=True, 
        verbose_name='Р”Р°С‚Р° РѕР±СЂР°Р±РѕС‚РєРё'
    )

    class Meta:
        verbose_name = 'РЎРѕРѕР±С‰РµРЅРёРµ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё'
        verbose_name_plural = 'РЎРѕРѕР±С‰РµРЅРёСЏ РѕР±СЂР°С‚РЅРѕР№ СЃРІСЏР·Рё'
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
        """РЎРѕРєСЂР°С‰РµРЅРЅР°СЏ РІРµСЂСЃРёСЏ СЃРѕРѕР±С‰РµРЅРёСЏ РґР»СЏ СЃРїРёСЃРєР° РІ Р°РґРјРёРЅРєРµ"""
        if len(self.message) > 100:
            return f"{self.message[:100]}..."
        return self.message