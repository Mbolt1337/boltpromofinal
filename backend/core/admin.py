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
    SiteSettings, AdminActionLog, Event, DailyAgg
)
from .admin_mixins import AntiMojibakeModelForm


# =============================================================================
# RESOURCES Р”Р›РЇ IMPORT-EXPORT
# =============================================================================

class CategoryResource(resources.ModelResource):
    """Р РµСЃСѓСЂСЃ РґР»СЏ РёРјРїРѕСЂС‚Р°/СЌРєСЃРїРѕСЂС‚Р° РєР°С‚РµРіРѕСЂРёР№"""
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon', 'is_active')
        export_order = ('id', 'name', 'slug', 'description', 'icon', 'is_active')


class StoreResource(resources.ModelResource):
    """Р РµСЃСѓСЂСЃ РґР»СЏ РёРјРїРѕСЂС‚Р°/СЌРєСЃРїРѕСЂС‚Р° РјР°РіР°Р·РёРЅРѕРІ"""
    
    class Meta:
        model = Store
        fields = ('id', 'name', 'slug', 'rating', 'description', 'site_url', 'is_active')
        export_order = ('id', 'name', 'slug', 'rating', 'site_url', 'is_active')


class PromoCodeResource(resources.ModelResource):
    """Р РµСЃСѓСЂСЃ РґР»СЏ РёРјРїРѕСЂС‚Р°/СЌРєСЃРїРѕСЂС‚Р° РїСЂРѕРјРѕРєРѕРґРѕРІ"""
    
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
            ('active', 'РђРєС‚РёРІРЅС‹Рµ (РЅРµ РёСЃС‚РµРєР»Рё)'),
            ('expired', 'РСЃС‚РµРєС€РёРµ'),
            ('hot', 'Р“РѕСЂСЏС‡РёРµ'),
            ('recommended', 'Р РµРєРѕРјРµРЅРґСѓРµРјС‹Рµ'),
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
    """Р¤РёР»СЊС‚СЂ РїРѕ С‚РёРїСѓ РїСЂРµРґР»РѕР¶РµРЅРёСЏ"""
    title = 'С‚РёРї РїСЂРµРґР»РѕР¶РµРЅРёСЏ'
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
    """РњР°СЃСЃРѕРІРѕРµ РґРµР№СЃС‚РІРёРµ: СЃРґРµР»Р°С‚СЊ Р°РєС‚РёРІРЅС‹РјРё"""
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f'РђРєС‚РёРІРёСЂРѕРІР°РЅРѕ: {updated} Р·Р°РїРёСЃРµР№.')
make_active.short_description = "вњ… РђРєС‚РёРІРёСЂРѕРІР°С‚СЊ РІС‹Р±СЂР°РЅРЅС‹Рµ"


def make_inactive(modeladmin, request, queryset):
    """РњР°СЃСЃРѕРІРѕРµ РґРµР№СЃС‚РІРёРµ: СЃРґРµР»Р°С‚СЊ РЅРµР°РєС‚РёРІРЅС‹РјРё"""
    updated = queryset.update(is_active=False)
    modeladmin.message_user(request, f'Р”РµР°РєС‚РёРІРёСЂРѕРІР°РЅРѕ: {updated} Р·Р°РїРёСЃРµР№.')
make_inactive.short_description = "вќЊ Р”РµР°РєС‚РёРІРёСЂРѕРІР°С‚СЊ РІС‹Р±СЂР°РЅРЅС‹Рµ"


def make_hot(modeladmin, request, queryset):
    """РњР°СЃСЃРѕРІРѕРµ РґРµР№СЃС‚РІРёРµ: СЃРґРµР»Р°С‚СЊ РіРѕСЂСЏС‡РёРјРё"""
    updated = queryset.filter(offer_type='coupon').update(is_hot=True)
    modeladmin.message_user(request, f'РћС‚РјРµС‡РµРЅРѕ РєР°Рє РіРѕСЂСЏС‡РёРµ: {updated} РїСЂРѕРјРѕРєРѕРґРѕРІ.')
make_hot.short_description = "рџ”Ґ РћС‚РјРµС‚РёС‚СЊ РєР°Рє РіРѕСЂСЏС‡РёРµ"


def make_recommended(modeladmin, request, queryset):
    """РњР°СЃСЃРѕРІРѕРµ РґРµР№СЃС‚РІРёРµ: СЃРґРµР»Р°С‚СЊ СЂРµРєРѕРјРµРЅРґСѓРµРјС‹РјРё"""
    updated = queryset.update(is_recommended=True)
    modeladmin.message_user(request, f'РћС‚РјРµС‡РµРЅРѕ РєР°Рє СЂРµРєРѕРјРµРЅРґСѓРµРјС‹Рµ: {updated} РїСЂРѕРјРѕРєРѕРґРѕРІ.')
make_recommended.short_description = "в­ђ РћС‚РјРµС‚РёС‚СЊ РєР°Рє СЂРµРєРѕРјРµРЅРґСѓРµРјС‹Рµ"


def mark_as_processed(modeladmin, request, queryset):
    """РњР°СЃСЃРѕРІРѕРµ РґРµР№СЃС‚РІРёРµ: РѕС‚РјРµС‚РёС‚СЊ СЃРѕРѕР±С‰РµРЅРёСЏ РєР°Рє РѕР±СЂР°Р±РѕС‚Р°РЅРЅС‹Рµ"""
    updated = queryset.update(is_processed=True, processed_at=timezone.now())
    modeladmin.message_user(request, f'РћР±СЂР°Р±РѕС‚Р°РЅРѕ: {updated} СЃРѕРѕР±С‰РµРЅРёР№.')
mark_as_processed.short_description = "вњ… РћС‚РјРµС‚РёС‚СЊ РєР°Рє РѕР±СЂР°Р±РѕС‚Р°РЅРЅС‹Рµ"


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
    
    # РўРѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
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
    icon_display.short_description = 'РРєРѕРЅРєР°'
    
    def promocodes_count(self, obj):
        count = obj.promocodes_count
        if count > 0:
            url = reverse('admin:core_promocode_changelist')
            return format_html(
                '<a href="{}?categories__id__exact={}">{}</a>',
                url, obj.id, count
            )
        return count
    promocodes_count.short_description = 'РџСЂРѕРјРѕРєРѕРґС‹'
    
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
        ('РћСЃРЅРѕРІРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Р’РёР·СѓР°Р»СЊРЅРѕРµ РѕС„РѕСЂРјР»РµРЅРёРµ', {
            'fields': ('logo', 'rating')
        }),
        ('Ссылки', {
            'fields': ('site_url',)
        }),
        ('РќР°СЃС‚СЂРѕР№РєРё', {
            'fields': ('is_active',)
        }),
    )
    
    # РўРѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
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
        return 'вЂ”'
    logo_preview.short_description = 'Р›РѕРіРѕ'
    
    def site_link(self, obj):
        if obj.site_url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">🔗 Сайт</a>',
                obj.site_url
            )
        return 'вЂ"'
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
    promocodes_count.short_description = 'РџСЂРѕРјРѕРєРѕРґС‹'
    
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
        ('рџЋЇ РћСЃРЅРѕРІРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ', {
            'fields': ('title', 'description', 'store', 'categories')
        }),
        ('рџ’° РџСЂРµРґР»РѕР¶РµРЅРёРµ', {
            'fields': (
                'offer_type', 'code', 'discount_value', 'discount_label',
                'affiliate_url'
            )
        }),
        ('рџ“ќ РџРѕРґСЂРѕР±РЅРѕСЃС‚Рё', {
            'fields': ('long_description', 'steps', 'fine_print', 'disclaimer'),
            'classes': ['collapse']
        }),
        ('⚡ Специальные отметки', {
            'fields': ('is_hot', 'is_recommended'),
            'classes': ['wide']
        }),
        ('вЏ° Р’СЂРµРјРµРЅРЅС‹Рµ СЂР°РјРєРё', {
            'fields': ('expires_at',)
        }),
        ('рџ”§ РќР°СЃС‚СЂРѕР№РєРё', {
            'fields': ('is_active',),
            'classes': ['collapse']
        }),
    )
    
    # РўРѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹Рµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
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
    title_short.short_description = 'Р—Р°РіРѕР»РѕРІРѕРє'
    
    def offer_type_badge(self, obj):
        colors = {
            'coupon': 'success',      # Р·РµР»РµРЅС‹Р№
            'deal': 'primary',        # СЃРёРЅРёР№  
            'financial': 'warning',   # Р¶РµР»С‚С‹Р№
            'cashback': 'info'        # РіРѕР»СѓР±РѕР№
        }
        color = colors.get(obj.offer_type, 'secondary')
        return format_html(
            '<span class="badge badge-{}">{}</span>',
            color, obj.get_offer_type_display()
        )
    offer_type_badge.short_description = 'РўРёРї'
    
    def discount_display(self, obj):
        if obj.discount_value:
            return f"{obj.discount_value}%"
        return 'вЂ”'
    discount_display.short_description = 'Скидка'
    
    def code_display(self, obj):
        if obj.code:
            return format_html(
                '<code style="background: #f1f1f1; padding: 2px 6px; border-radius: 3px;">{}</code>',
                obj.code
            )
        return 'вЂ”'
    code_display.short_description = 'РљРѕРґ'
    
    def status_badges(self, obj):
        badges = []
        now = timezone.now()
        
        # Статус активности/истечения
        if obj.expires_at <= now:
            badges.append('<span class="badge badge-danger">РСЃС‚С‘Рє</span>')
        elif obj.is_active:
            badges.append('<span class="badge badge-success">РђРєС‚РёРІРµРЅ</span>')
        else:
            badges.append('<span class="badge badge-secondary">РќРµР°РєС‚РёРІРµРЅ</span>')

        # Специальные отметки
        if obj.is_hot:
            badges.append('<span class="badge badge-warning">рџ”Ґ Р“РѕСЂСЏС‡РёР№</span>')
        if obj.is_recommended:
            badges.append('<span class="badge badge-info">в­ђ BoltPromo</span>')
            
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
        return obj.subtitle or 'вЂ”'
    subtitle_short.short_description = 'РџРѕРґР·Р°РіРѕР»РѕРІРѕРє'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="60" height="40" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return 'вЂ”'
    image_preview.short_description = 'РџСЂРµРІСЊСЋ'
    
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
        return 'вЂ”'
    logo_preview.short_description = 'Р›РѕРіРѕ'
    
    def partner_link(self, obj):
        if obj.url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener">🔗 Сайт</a>',
                obj.url
            )
        return 'вЂ”'
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
            return f"{length:,} СЃРёРјРІРѕР»РѕРІ"
        return f"{length} СЃРёРјРІРѕР»РѕРІ"
    content_length.short_description = 'Р Р°Р·РјРµСЂ РєРѕРЅС‚РµРЅС‚Р°'
    
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
        ('рџЊђ РњРµС‚Р°РґР°РЅРЅС‹Рµ', {
            'fields': ('page', 'user_agent', 'ip_address', 'created_at'),
            'classes': ['collapse']
        }),
        ('вљЎ РћР±СЂР°Р±РѕС‚РєР°', {
            'fields': ('is_processed', 'processed_at', 'is_spam')
        }),
    )
    
    def subject_short(self, obj):
        if obj.subject and len(obj.subject) > 30:
            return f"{obj.subject[:27]}..."
        return obj.subject or 'вЂ”'
    subject_short.short_description = 'РўРµРјР°'
    
    def message_short(self, obj):
        return obj.short_message
    message_short.short_description = 'Сообщение'
    
    def status_display(self, obj):
        if obj.is_spam:
            return format_html('<span class="badge badge-danger">Спам</span>')
        elif obj.is_processed:
            return format_html('<span class="badge badge-success">РћР±СЂР°Р±РѕС‚Р°РЅРѕ</span>')
        else:
            return format_html('<span class="badge badge-warning">РќРѕРІРѕРµ</span>')
    status_display.short_description = 'Статус'
    
    actions = [mark_as_processed, 'mark_as_spam']
    
    def mark_as_spam(self, request, queryset):
        updated = queryset.update(is_spam=True, is_processed=True, processed_at=timezone.now())
        self.message_user(request, f'РћС‚РјРµС‡РµРЅРѕ РєР°Рє СЃРїР°Рј: {updated} СЃРѕРѕР±С‰РµРЅРёР№.')
    mark_as_spam.short_description = "рџљ« РћС‚РјРµС‚РёС‚СЊ РєР°Рє СЃРїР°Рј"


# =============================================================================
# РќРђРЎРўР РћР™РљР РђР”РњРРќРљР
# =============================================================================

# РР·РјРµРЅРµРЅРёРµ Р·Р°РіРѕР»РѕРІРєРѕРІ Р°РґРјРёРЅРєРё
admin.site.site_header = "BoltPromo - РђРґРјРёРЅРєР°"
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
    list_display = ['created_at', 'event_type', 'promo', 'store', 'showcase', 'is_unique', 'client_ip']
    list_filter = ['event_type', 'is_unique', 'created_at']
    search_fields = ['session_id', 'client_ip', 'promo__title', 'store__name']
    readonly_fields = [
        'created_at', 'event_type', 'promo', 'store', 'showcase',
        'session_id', 'client_ip', 'user_agent', 'ref',
        'utm_source', 'utm_medium', 'utm_campaign', 'is_unique'
    ]
    date_hierarchy = 'created_at'

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

    def has_add_permission(self, request):
        return False