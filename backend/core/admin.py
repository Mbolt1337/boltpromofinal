from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.admin import SimpleListFilter
from import_export import resources, fields
from import_export.admin import ImportExportModelAdmin, ExportMixin
from import_export.widgets import ForeignKeyWidget, ManyToManyWidget

from .models import (
    Category, Store, PromoCode, Banner, Partner,
    StaticPage, ContactMessage, Showcase, ShowcaseItem,
    SiteSettings, AdminActionLog, Event, DailyAgg, SiteAssets
)
from .admin_mixins import AntiMojibakeModelForm


# =============================================================================
# RESOURCES ДЛЯ IMPORT-EXPORT
# =============================================================================

class CategoryResource(resources.ModelResource):
    """Ресурс для импорта/экспорта категорий"""
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon', 'is_active')
        export_order = ('id', 'name', 'slug', 'description', 'icon', 'is_active')


class StoreResource(resources.ModelResource):
    """Ресурс для импорта/экспорта магазинов"""
    
    class Meta:
        model = Store
        fields = ('id', 'name', 'slug', 'rating', 'description', 'site_url', 'is_active')
        export_order = ('id', 'name', 'slug', 'rating', 'site_url', 'is_active')


class PromoCodeResource(resources.ModelResource):
    """Ресурс для импорта/экспорта промокодов"""
    
    store = fields.Field(
        column_name='store',
        attribute='store',
        widget=ForeignKeyWidget(Store, 'name')
    )
    
    categories = fields.Field(
        column_name='categories',
        attribute='categories',
        widget=ManyToManyWidget(Category, field='name', separator='|')
    )
    
    class Meta:
        model = PromoCode
        fields = (
            'id', 'title', 'description', 'offer_type', 'code', 
            'discount_value', 'discount_label', 'is_hot', 'is_recommended',
            'expires_at', 'affiliate_url', 'store', 'categories', 'is_active'
        )
        export_order = (
            'id', 'title', 'store', 'offer_type', 'discount_value', 
            'code', 'expires_at', 'is_hot', 'is_recommended', 'is_active'
        )


# =============================================================================
# CUSTOM FILTERS
# =============================================================================

class ActivePromocodesFilter(SimpleListFilter):
    """Фильтр активных промокодов (не истекших)"""
    title = 'статус промокодов'
    parameter_name = 'promo_status'

    def lookups(self, request, model_admin):
        return (
            ('active', 'Активные (не истекли)'),
            ('expired', 'Истекшие'),
            ('hot', 'Горячие'),
            ('recommended', 'Рекомендуемые'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'active':
            return queryset.filter(
                is_active=True, 
                expires_at__gt=timezone.now()
            )
        elif self.value() == 'expired':
            return queryset.filter(expires_at__lte=timezone.now())
        elif self.value() == 'hot':
            return queryset.filter(is_hot=True)
        elif self.value() == 'recommended':
            return queryset.filter(is_recommended=True)
        return queryset


class OfferTypeFilter(SimpleListFilter):
    """Фильтр по типу предложения"""
    title = 'тип предложения'
    parameter_name = 'offer_type'

    def lookups(self, request, model_admin):
        return PromoCode.OFFER_TYPE_CHOICES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(offer_type=self.value())
        return queryset


# =============================================================================
# CUSTOM ACTIONS
# =============================================================================

def make_active(modeladmin, request, queryset):
    """Массовое действие: сделать активными"""
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f'Активировано: {updated} записей.')
make_active.short_description = "✅ Активировать выбранные"


def make_inactive(modeladmin, request, queryset):
    """Массовое действие: сделать неактивными"""
    updated = queryset.update(is_active=False)
    modeladmin.message_user(request, f'Деактивировано: {updated} записей.')
make_inactive.short_description = "❌ Деактивировать выбранные"


def make_hot(modeladmin, request, queryset):
    """Массовое действие: сделать горячими"""
    updated = queryset.filter(offer_type='coupon').update(is_hot=True)
    modeladmin.message_user(request, f'Отмечено как горячие: {updated} промокодов.')
make_hot.short_description = "🔥 Отметить как горячие"


def make_recommended(modeladmin, request, queryset):
    """Массовое действие: сделать рекомендуемыми"""
    updated = queryset.update(is_recommended=True)
    modeladmin.message_user(request, f'Отмечено как рекомендуемые: {updated} промокодов.')
make_recommended.short_description = "⭐ Отметить как рекомендуемые"


def mark_as_processed(modeladmin, request, queryset):
    """Массовое действие: отметить сообщения как обработанные"""
    updated = queryset.update(is_processed=True, processed_at=timezone.now())
    modeladmin.message_user(request, f'Обработано: {updated} сообщений.')
mark_as_processed.short_description = "✅ Отметить как обработанные"


# =============================================================================
# ADMIN CLASSES
# =============================================================================

@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin):
    resource_class = CategoryResource
    
    list_display = ['name', 'slug', 'icon_display', 'promocodes_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    list_editable = ['is_active']
    prepopulated_fields = {'slug': ('name',)}

    # Только активные по умолчанию
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.GET.get('is_active__exact'):
            return qs.filter(is_active=True)
        return qs
    
    def icon_display(self, obj):
        if obj.icon:
            return format_html(
                '<i class="fas fa-{}"></i> {}',
                obj.icon, obj.icon
            )
        return 'вЂ”'
    icon_display.short_description = 'Иконка'
    
    def promocodes_count(self, obj):
        count = obj.promocodes_count
        if count > 0:
            url = reverse('admin:core_promocode_changelist')
            return format_html(
                '<a href="{}?categories__id__exact={}">{}</a>',
                url, obj.id, count
            )
        return count
    promocodes_count.short_description = 'Промокоды'
    
    actions = [make_active, make_inactive]


@admin.register(Store)
class StoreAdmin(ImportExportModelAdmin):
    resource_class = StoreResource
    
    list_display = [
        'name', 'slug', 'logo_preview', 'rating', 'promocodes_count', 
        'site_link', 'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'rating', 'created_at']
    search_fields = ['name', 'slug', 'description']
    list_editable = ['is_active', 'rating']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Визуальное оформление', {
            'fields': ('logo', 'rating')
        }),
        ('Ссылки', {
            'fields': ('site_url',)
        }),
        ('Настройки', {
            'fields': ('is_active',)
        }),
    )
    
    # Только активные по умолчанию
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.GET.get('is_active__exact'):
            return qs.filter(is_active=True)
        return qs

    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" width="40" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.logo.url
            )
        return '—'
    logo_preview.short_description = 'Лого'
    
    def site_link(self, obj):
        if obj.site_url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">🔗 Сайт</a>',
                obj.site_url
            )
        return '—'
    site_link.short_description = 'Сайт'
    
    def promocodes_count(self, obj):
        count = obj.promocodes_count
        if count > 0:
            url = reverse('admin:core_promocode_changelist')
            return format_html(
                '<a href="{}?store__id__exact={}">{}</a>',
                url, obj.id, count
            )
        return count
    promocodes_count.short_description = 'Промокоды'
    
    actions = [make_active, make_inactive]


class PromoCodeAdminForm(AntiMojibakeModelForm):
    """Форма с защитой от кракозябр"""
    class Meta:
        model = PromoCode
        fields = '__all__'


@admin.register(PromoCode)
class PromoCodeAdmin(ImportExportModelAdmin):
    resource_class = PromoCodeResource
    form = PromoCodeAdminForm
    
    list_display = [
        'title_short', 'store', 'offer_type_badge', 'discount_display', 
        'code_display', 'status_badges', 'expires_at', 'views_count', 'is_active'
    ]
    
    list_filter = [
        ActivePromocodesFilter, OfferTypeFilter, 'is_active', 
        'is_hot', 'is_recommended', 'store', 'categories', 'created_at'
    ]
    
    search_fields = ['title', 'description', 'code', 'store__name']
    list_editable = ['is_active']
    filter_horizontal = ['categories']
    
    date_hierarchy = 'expires_at'
    
    fieldsets = (
        ('🎯 Основная информация', {
            'fields': ('title', 'description', 'store', 'categories')
        }),
        ('💰 Предложение', {
            'fields': (
                'offer_type', 'code', 'discount_value', 'discount_label',
                'affiliate_url'
            )
        }),
        ('📝 Подробности', {
            'fields': ('long_description', 'steps', 'fine_print', 'disclaimer'),
            'classes': ['collapse']
        }),
        ('⚡ Специальные отметки', {
            'fields': ('is_hot', 'is_recommended'),
            'classes': ['wide']
        }),
        ('⏰ Временные рамки', {
            'fields': ('expires_at',)
        }),
        ('🔧 Настройки', {
            'fields': ('is_active',),
            'classes': ['collapse']
        }),
    )
    
    # Только активные по умолчанию
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.GET.get('is_active__exact'):
            return qs.filter(is_active=True)
        return qs

    def title_short(self, obj):
        title = obj.title
        if len(title) > 50:
            return f"{title[:47]}..."
        return title
    title_short.short_description = 'Заголовок'
    
    def offer_type_badge(self, obj):
        colors = {
            'coupon': 'success',      # зеленый
            'deal': 'primary',        # синий
            'financial': 'warning',   # желтый
            'cashback': 'info'        # голубой
        }
        color = colors.get(obj.offer_type, 'secondary')
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            color, obj.get_offer_type_display()
        )
    offer_type_badge.short_description = 'Тип'
    
    def discount_display(self, obj):
        if obj.discount_value:
            return f"{obj.discount_value}%"
        return '—'
    discount_display.short_description = 'Скидка'

    def code_display(self, obj):
        if obj.code:
            return format_html(
                '<code style="background: #f1f1f1; padding: 2px 6px; border-radius: 3px;">{}</code>',
                obj.code
            )
        return '—'
    code_display.short_description = 'Код'
    
    def status_badges(self, obj):
        badges = []
        now = timezone.now()
        
        # Статус активности/истечения
        if obj.expires_at <= now:
            badges.append('<span class="badge badge-danger">Истёк</span>')
        elif obj.is_active:
            badges.append('<span class="badge badge-success">Активен</span>')
        else:
            badges.append('<span class="badge badge-secondary">Неактивен</span>')

        # Специальные отметки
        if obj.is_hot:
            badges.append('<span class="badge badge-warning">🔥 Горячий</span>')
        if obj.is_recommended:
            badges.append('<span class="badge badge-info">⭐ BoltPromo</span>')
            
        return format_html(' '.join(badges))
    status_badges.short_description = 'Статус'
    
    actions = [make_active, make_inactive, make_hot, make_recommended]


class BannerAdminForm(AntiMojibakeModelForm):
    """Форма с защитой от кракозябр"""
    class Meta:
        model = Banner
        fields = '__all__'


@admin.register(Banner)
class BannerAdmin(ExportMixin, admin.ModelAdmin):
    form = BannerAdminForm
    list_display = ['title', 'subtitle_short', 'image_preview', 'cta_text', 'cta_link', 'is_active', 'sort_order']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'subtitle', 'cta_text']
    list_editable = ['is_active', 'sort_order']
    fields = ('image', 'cta_url', 'title', 'subtitle', 'cta_text', 'is_active', 'sort_order')
    
    def subtitle_short(self, obj):
        if obj.subtitle and len(obj.subtitle) > 40:
            return f"{obj.subtitle[:37]}..."
        return obj.subtitle or '—'
    subtitle_short.short_description = 'Подзаголовок'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '—'
    image_preview.short_description = 'Превью'
    
    def cta_link(self, obj):
        if obj.cta_url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">рџ”— {}</a>',
                obj.cta_url, obj.cta_text
            )
        return 'вЂ”'
    cta_link.short_description = 'Ссылка'
    
    actions = [make_active, make_inactive]


@admin.register(Partner)
class PartnerAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ['name', 'logo_preview', 'partner_link', 'order', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    list_editable = ['is_active', 'order']
    
    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" width="40" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.logo.url
            )
        return '—'
    logo_preview.short_description = 'Лого'

    def partner_link(self, obj):
        if obj.url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">🔗 Сайт</a>',
                obj.url
            )
        return '—'
    partner_link.short_description = 'Сайт'
    
    actions = [make_active, make_inactive]


class StaticPageAdminForm(AntiMojibakeModelForm):
    """Форма с защитой от кракозябр"""
    class Meta:
        model = StaticPage
        fields = '__all__'


@admin.register(StaticPage)
class StaticPageAdmin(ExportMixin, admin.ModelAdmin):
    form = StaticPageAdminForm
    list_display = ['get_slug_display', 'title', 'content_length', 'is_active', 'updated_at']
    list_filter = ['is_active', 'slug', 'updated_at']
    search_fields = ['title', 'content']
    list_editable = ['is_active']
    
    def content_length(self, obj):
        length = len(obj.content)
        if length > 1000:
            return f"{length:,} символов"
        return f"{length} символов"
    content_length.short_description = 'Размер контента'
    
    actions = [make_active, make_inactive]


@admin.register(ContactMessage)
class ContactMessageAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        'created_at', 'name', 'email', 'subject_short', 
        'message_short', 'page', 'status_display', 'is_processed'
    ]
    
    list_filter = [
        'is_processed', 'is_spam', 'created_at', 'page'
    ]
    
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['is_processed']
    date_hierarchy = 'created_at'
    readonly_fields = ['user_agent', 'ip_address', 'created_at', 'processed_at']
    
    fieldsets = (
        ('📧 Сообщение', {
            'fields': ('name', 'email', 'subject', 'message')
        }),
        ('🏷️ Метаданные', {
            'fields': ('page', 'user_agent', 'ip_address', 'created_at'),
            'classes': ['collapse']
        }),
        ('⚡ Обработка', {
            'fields': ('is_processed', 'processed_at', 'is_spam')
        }),
    )
    
    def subject_short(self, obj):
        if obj.subject and len(obj.subject) > 30:
            return f"{obj.subject[:27]}..."
        return obj.subject or '—'
    subject_short.short_description = 'Тема'
    
    def message_short(self, obj):
        return obj.short_message
    message_short.short_description = 'Сообщение'
    
    def status_display(self, obj):
        if obj.is_spam:
            return format_html('<span class="badge badge-danger">Спам</span>')
        elif obj.is_processed:
            return format_html('<span class="badge badge-success">Обработано</span>')
        else:
            return format_html('<span class="badge badge-warning">Новое</span>')
    status_display.short_description = 'Статус'
    
    actions = [mark_as_processed, 'mark_as_spam']
    
    def mark_as_spam(self, request, queryset):
        updated = queryset.update(is_spam=True, is_processed=True, processed_at=timezone.now())
        self.message_user(request, f'Отмечено как спам: {updated} сообщений.')
    mark_as_spam.short_description = "🚫 Отметить как спам"


# =============================================================================
# НАСТРОЙКА АДМИНКИ
# =============================================================================

# Изменение заголовков админки
admin.site.site_header = "BoltPromo - Админка"
admin.site.site_title = "BoltPromo Admin"


class ShowcaseItemInline(admin.TabularInline):
    """Инлайн для управления промокодами в витрине"""
    model = ShowcaseItem
    extra = 1
    fields = ('promocode', 'position')
    autocomplete_fields = ['promocode']
    ordering = ('position',)
    verbose_name = 'Промокод в витрине'
    verbose_name_plural = 'Промокоды в витрине'


@admin.register(Showcase)
class ShowcaseAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        'title', 'slug', 'banner_preview', 'promos_count_display',
        'is_active', 'sort_order', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description', 'slug']
    list_editable = ['is_active', 'sort_order']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ShowcaseItemInline]

    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'slug', 'description')
        }),
        ('Визуал', {
            'fields': ('banner',)
        }),
        ('Настройки', {
            'fields': ('is_active', 'sort_order')
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.annotate(promos_count=Count('items'))
        if not request.GET.get('is_active__exact'):
            return qs.filter(is_active=True)
        return qs

    def banner_preview(self, obj):
        if obj.banner:
            return format_html(
                '<img src="{}" width="80" height="45" style="object-fit: cover; border-radius: 4px;" />',
                obj.banner.url
            )
        return '—'
    banner_preview.short_description = 'Баннер'

    def promos_count_display(self, obj):
        count = getattr(obj, 'promos_count', 0)
        if count > 0:
            return format_html(
                '<span style="font-weight: bold; color: #417690;">{} промо</span>',
                count
            )
        return '—'
    promos_count_display.short_description = 'Количество'

    actions = [make_active, make_inactive]


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """Админка для настроек сайта (singleton)"""

    fieldsets = (
        ('🔧 Режим техработ', {
            'fields': (
                'maintenance_enabled', 'maintenance_message',
                'maintenance_expected_end', 'maintenance_telegram_url',
                'maintenance_ip_whitelist'
            )
        }),
        ('🔍 SEO настройки', {
            'fields': ('canonical_host', 'robots_txt', 'noindex_expired_promos')
        }),
        ('💾 Кэш', {
            'fields': ('allow_admin_cache_flush',)
        }),
    )

    def has_add_permission(self, request):
        """Запрещаем создание новых записей (singleton)"""
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление настроек"""
        return False

    def changelist_view(self, request, extra_context=None):
        """Автоматически открываем единственную запись"""
        obj = SiteSettings.objects.first()
        if obj:
            from django.shortcuts import redirect
            return redirect('admin:core_sitesettings_change', obj.pk)
        return super().changelist_view(request, extra_context)

    change_form_template = 'admin/site_settings_change_form.html'


@admin.register(AdminActionLog)
class AdminActionLogAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ['created_at', 'user', 'action', 'details_short']
    list_filter = ['created_at', 'user', 'action']
    search_fields = ['user', 'action', 'details']
    readonly_fields = ['user', 'action', 'details', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def details_short(self, obj):
        if len(obj.details) > 50:
            return f"{obj.details[:47]}..."
        return obj.details
    details_short.short_description = 'Детали'


@admin.register(Event)
class EventAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ['created_at', 'event_type', 'promo', 'store', 'showcase', 'is_unique', 'session_id_short', 'client_ip']
    list_filter = ['event_type', 'is_unique', 'created_at', 'store', 'showcase']
    search_fields = ['session_id', 'client_ip', 'user_agent', 'utm_source', 'utm_campaign', 'promo__title', 'store__name']
    readonly_fields = [
        'created_at', 'event_type', 'promo', 'store', 'showcase',
        'session_id', 'client_ip', 'user_agent', 'ref',
        'utm_source', 'utm_medium', 'utm_campaign', 'is_unique'
    ]
    date_hierarchy = 'created_at'
    list_per_page = 50
    list_max_show_all = 200
    actions = ['export_csv_events']

    class Media:
        css = {
            'all': ('admin/admin-tweaks.css',)
        }

    def session_id_short(self, obj):
        """Короткий ID сессии для компактного отображения"""
        return obj.session_id[:8] + "…" if obj.session_id else "—"
    session_id_short.short_description = 'Session ID'

    def export_csv_events(self, request, queryset):
        """Экспорт выбранных событий в CSV"""
        import csv
        from django.http import HttpResponse
        from datetime import datetime

        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="events_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Дата', 'Тип события', 'Промокод', 'Магазин', 'Витрина', 'Уникальное', 'Session ID', 'IP', 'User Agent', 'UTM Source', 'UTM Campaign'])

        for event in queryset:
            writer.writerow([
                event.created_at.strftime('%Y-%m-%d %H:%M:%S') if event.created_at else '',
                event.event_type,
                event.promo.title if event.promo else '',
                event.store.name if event.store else '',
                event.showcase.title if event.showcase else '',
                'Да' if event.is_unique else 'Нет',
                event.session_id or '',
                event.client_ip or '',
                event.user_agent or '',
                event.utm_source or '',
                event.utm_campaign or '',
            ])

        return response
    export_csv_events.short_description = "Экспортировать выбранные события в CSV"

    def changelist_view(self, request, extra_context=None):
        from django.contrib import messages
        extra_context = extra_context or {}
        extra_context['title'] = 'События и аналитика'
        extra_context['subtitle'] = 'Просмотр всех событий: просмотры, клики, копирования промокодов и действия с витринами'

        # Пустое состояние
        if not Event.objects.exists():
            messages.info(request, 'Пока данных нет. События начнут накапливаться автоматически при взаимодействиях пользователей.')

        return super().changelist_view(request, extra_context)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(DailyAgg)
class DailyAggAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ['date', 'event_type', 'promo', 'store', 'showcase', 'count', 'unique_count']
    list_filter = ['event_type', 'date']
    search_fields = ['promo__title', 'store__name', 'showcase__title']
    readonly_fields = ['date', 'event_type', 'promo', 'store', 'showcase', 'count', 'unique_count']
    date_hierarchy = 'date'
    list_per_page = 50
    list_max_show_all = 200
    actions = ['export_csv_dailyagg']

    class Media:
        css = {
            'all': ('admin/admin-tweaks.css',)
        }

    def export_csv_dailyagg(self, request, queryset):
        """Экспорт выбранных агрегатов в CSV"""
        import csv
        from django.http import HttpResponse
        from datetime import datetime

        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="daily_stats_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'

        writer = csv.writer(response)
        writer.writerow(['Дата', 'Тип события', 'Промокод', 'Магазин', 'Витрина', 'Всего', 'Уникальных'])

        for agg in queryset:
            writer.writerow([
                agg.date.strftime('%Y-%m-%d') if agg.date else '',
                agg.event_type,
                agg.promo.title if agg.promo else '',
                agg.store.name if agg.store else '',
                agg.showcase.title if agg.showcase else '',
                agg.count,
                agg.unique_count,
            ])

        return response
    export_csv_dailyagg.short_description = "Экспортировать выбранные агрегаты в CSV"

    def changelist_view(self, request, extra_context=None):
        from django.contrib import messages
        extra_context = extra_context or {}
        extra_context['title'] = 'Агрегированная статистика'
        extra_context['subtitle'] = 'Ежедневная статистика по промокодам, магазинам и витринам с подсчетом уникальных действий'

        # Пустое состояние
        if not DailyAgg.objects.exists():
            messages.info(request, 'Пока данных нет. Агрегаты создаются автоматически при накоплении событий. Запустите команду aggregate_events для первичной агрегации.')

        return super().changelist_view(request, extra_context)

    def has_add_permission(self, request):
        return False


@admin.register(SiteAssets)
class SiteAssetsAdmin(admin.ModelAdmin):
    """Админка для медиа-ресурсов сайта (singleton)"""

    fieldsets = (
        ('🖼️ Favicon', {
            'fields': ('favicon_src', 'favicon_preview'),
            'description': 'Загрузите PNG/ICO изображение 512×512px. Будут автоматически сгенерированы: favicon.ico, favicon-16.png, favicon-32.png'
        }),
        ('📱 Open Graph и Social Media', {
            'fields': ('og_default', 'og_preview', 'twitter_default'),
            'description': 'OG: 1200×630px, Twitter: 1200×600px (опционально)'
        }),
        ('🍎 Apple и PWA', {
            'fields': ('apple_touch_icon_src', 'apple_preview', 'pwa_icon_src', 'pwa_preview', 'safari_pinned_svg'),
            'description': 'Apple: 180×180px, PWA: 512×512px (будут созданы варианты 192, 512, maskable)'
        }),
        ('🎨 PWA Цвета', {
            'fields': ('theme_color', 'background_color')
        }),
        ('📊 Информация о генерации', {
            'fields': ('last_generated_at', 'generated_files_info'),
            'classes': ['collapse']
        }),
    )

    readonly_fields = [
        'favicon_preview', 'og_preview', 'apple_preview', 'pwa_preview',
        'last_generated_at', 'generated_files_info'
    ]

    def favicon_preview(self, obj):
        if obj.favicon_src:
            return format_html(
                '<img src="{}" width="64" height="64" style="image-rendering: pixelated; border: 1px solid #3f4451; border-radius: 4px;" /><br><small>Исходник</small>',
                obj.favicon_src.url
            )
        return '—'
    favicon_preview.short_description = 'Превью'

    def og_preview(self, obj):
        if obj.og_default:
            return format_html(
                '<img src="{}" width="300" style="border: 1px solid #3f4451; border-radius: 8px;" /><br><small>1200×630px</small>',
                obj.og_default.url
            )
        return '—'
    og_preview.short_description = 'Превью OG'

    def apple_preview(self, obj):
        if obj.apple_touch_icon_src:
            return format_html(
                '<img src="{}" width="90" height="90" style="border: 1px solid #3f4451; border-radius: 12px;" /><br><small>Apple Touch Icon</small>',
                obj.apple_touch_icon_src.url
            )
        return '—'
    apple_preview.short_description = 'Превью'

    def pwa_preview(self, obj):
        if obj.pwa_icon_src:
            return format_html(
                '<img src="{}" width="128" height="128" style="border: 1px solid #3f4451; border-radius: 4px;" /><br><small>PWA Icon</small>',
                obj.pwa_icon_src.url
            )
        return '—'
    pwa_preview.short_description = 'Превью'

    def generated_files_info(self, obj):
        files = []
        if obj.favicon_ico_path:
            files.append(f'✓ favicon.ico: {obj.favicon_ico_path}')
        if obj.favicon_16_path:
            files.append(f'✓ favicon-16.png: {obj.favicon_16_path}')
        if obj.favicon_32_path:
            files.append(f'✓ favicon-32.png: {obj.favicon_32_path}')
        if obj.apple_touch_icon_path:
            files.append(f'✓ apple-touch-icon.png: {obj.apple_touch_icon_path}')
        if obj.pwa_192_path:
            files.append(f'✓ icon-192.png: {obj.pwa_192_path}')
        if obj.pwa_512_path:
            files.append(f'✓ icon-512.png: {obj.pwa_512_path}')
        if obj.pwa_maskable_path:
            files.append(f'✓ maskable-icon-512.png: {obj.pwa_maskable_path}')

        if files:
            return format_html('<br>'.join(files))
        return 'Нет сгенерированных файлов. Загрузите исходники и сохраните.'
    generated_files_info.short_description = 'Сгенерированные файлы'

    def has_add_permission(self, request):
        """Запрещаем создание новых записей (singleton)"""
        return not SiteAssets.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Запрещаем удаление"""
        return False

    def changelist_view(self, request, extra_context=None):
        """Автоматически открываем единственную запись"""
        obj = SiteAssets.objects.first()
        if obj:
            from django.shortcuts import redirect
            return redirect('admin:core_siteassets_change', obj.pk)
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        """Запускаем генерацию производных при сохранении"""
        super().save_model(request, obj, form, change)

        # Запускаем Celery задачу генерации
        try:
            from .tasks import generate_site_assets
            task = generate_site_assets.delay(obj.id)
            messages.success(request, f'Запущена генерация медиа-файлов (задача {task.id})')
        except Exception as e:
            messages.warning(request, f'Не удалось запустить генерацию: {str(e)}. Проверьте настройки Celery.')

    change_form_template = 'admin/siteassets_change_form.html'
