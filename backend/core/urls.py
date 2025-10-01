from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_analytics

# Router для ViewSet'ов
router = DefaultRouter()
router.register(r'showcases', views.ShowcaseViewSet, basename='showcase')

urlpatterns = [
    # Health Check для мониторинга
    path('health/', views.health_check, name='health-check'),
    
    # Категории
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # ИСПРАВЛЕНО: Новый endpoint с пагинацией
    path('categories/<slug:slug>/promocodes/', views.CategoryPromocodesView.as_view(), name='category-promocodes-paginated'),
    
    # DEPRECATED: Старый endpoint без пагинации (для совместимости)
    path('categories/<slug:slug>/promocodes/old/', views.category_promocodes, name='category-promocodes-old'),
    
    # Магазины
    path('stores/', views.StoreListView.as_view(), name='store-list'),
    path('stores/<slug:slug>/', views.StoreDetailView.as_view(), name='store-detail'),
    
    # ИСПРАВЛЕНО: Новый endpoint с пагинацией
    path('stores/<slug:slug>/promocodes/', views.StorePromocodesView.as_view(), name='store-promocodes-paginated'),
    
    # DEPRECATED: Старый endpoint без пагинации (для совместимости)
    path('stores/<slug:slug>/promocodes/old/', views.store_promocodes, name='store-promocodes-old'),
    
    path('stores/<slug:slug>/stats/', views.store_stats, name='store-stats'),
    
    # Промокоды
    path('promocodes/', views.PromoCodeListView.as_view(), name='promocode-list'),
    path('promocodes/<int:pk>/', views.PromoCodeDetailView.as_view(), name='promocode-detail'),
    path('promocodes/<int:promo_id>/increment-views/', views.increment_promo_views, name='increment-views'),
    
    # Поиск
    path('search/', views.global_search, name='global-search'),
    
    # Обратная связь
    path('contact/', views.ContactMessageCreateView.as_view(), name='contact-create'),
    path('contact/stats/', views.contact_stats, name='contact-stats'),
    
    # Статистика
    path('stats/global/', views.global_stats, name='global-stats'),
    
    # Контент
    path('banners/', views.BannerListView.as_view(), name='banner-list'),
    path('partners/', views.PartnerListView.as_view(), name='partner-list'),
    path('pages/<slug:slug>/', views.StaticPageDetailView.as_view(), name='staticpage-detail'),

    # Витрины (подборки)
    path('', include(router.urls)),

    # Трекинг событий
    path('track/', views_analytics.track_events, name='track-events'),

    # Статистика для админ-дашборда
    path('stats/top-promos/', views_analytics.stats_top_promos, name='stats-top-promos'),
    path('stats/top-stores/', views_analytics.stats_top_stores, name='stats-top-stores'),
    path('stats/types-share/', views_analytics.stats_types_share, name='stats-types-share'),
    path('stats/showcases-ctr/', views_analytics.stats_showcases_ctr, name='stats-showcases-ctr'),
]