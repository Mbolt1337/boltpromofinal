from django.contrib import admin
from django.urls import path, include
from core import views as core_views
from core import admin_views
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('robots.txt', core_views.robots_txt, name='robots-txt'),

    # Admin actions
    path('admin/flush-cache/', admin_views.flush_cache_view, name='admin_flush_cache'),
    path('admin/flush-cache/pages/', lambda r: admin_views.flush_cache_view(r, 'pages'), name='admin_flush_cache_pages'),
    path('admin/flush-cache/api/', lambda r: admin_views.flush_cache_view(r, 'api'), name='admin_flush_cache_api'),
    path('admin/toggle-maintenance/', admin_views.toggle_maintenance_view, name='admin_toggle_maintenance'),
    path('admin/regenerate-sitemap/', admin_views.regenerate_sitemap_view, name='admin_regenerate_sitemap'),
    path('admin/core/stats/', admin_views.stats_dashboard_view, name='admin_stats_dashboard'),

    path('admin/', admin.site.urls),
    path('api/v1/', include('core.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Раздача статических файлов только в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)