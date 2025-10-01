"""
Кастомные middleware
"""
import json
from django.http import HttpResponse, JsonResponse, HttpResponsePermanentRedirect
from django.template.loader import render_to_string
from django.utils import timezone
from django.conf import settings
from datetime import timedelta


def get_client_ip(request):
    """Получить реальный IP клиента"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class MaintenanceModeMiddleware:
    """
    Middleware для режима техработ.
    Проверяет настройки и показывает страницу 503 если техработы включены.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Импорт здесь чтобы избежать циклических зависимостей
        from .models import SiteSettings

        try:
            settings = SiteSettings.objects.first()
        except Exception:
            # Если таблица еще не создана (миграции)
            return self.get_response(request)

        if not settings or not settings.maintenance_enabled:
            return self.get_response(request)

        # Проверяем IP whitelist
        client_ip = get_client_ip(request)
        if client_ip in settings.maintenance_ip_whitelist:
            return self.get_response(request)

        # Проверяем админку (разрешаем доступ к админке всегда)
        if request.path.startswith('/admin/'):
            return self.get_response(request)

        # Для API возвращаем JSON
        if request.path.startswith('/api/'):
            retry_after = None
            if settings.maintenance_expected_end:
                delta = settings.maintenance_expected_end - timezone.now()
                if delta.total_seconds() > 0:
                    retry_after = settings.maintenance_expected_end.isoformat()

            response_data = {
                'maintenance': True,
                'message': settings.maintenance_message or 'Ведутся технические работы',
                'retry_after': retry_after
            }

            response = JsonResponse(response_data, status=503)
            if retry_after and settings.maintenance_expected_end:
                # Retry-After в секундах
                delta_seconds = int((settings.maintenance_expected_end - timezone.now()).total_seconds())
                if delta_seconds > 0:
                    response['Retry-After'] = str(delta_seconds)
            return response

        # Для обычных страниц рендерим HTML
        context = {
            'message': settings.maintenance_message or 'Ведутся технические работы. Мы скоро вернемся!',
            'expected_end': settings.maintenance_expected_end,
            'telegram_url': settings.maintenance_telegram_url,
        }

        html = render_to_string('maintenance.html', context, request=request)
        response = HttpResponse(html, status=503)

        if settings.maintenance_expected_end:
            delta_seconds = int((settings.maintenance_expected_end - timezone.now()).total_seconds())
            if delta_seconds > 0:
                response['Retry-After'] = str(delta_seconds)

        return response


class CanonicalHostMiddleware:
    """
    Middleware для редиректа на канонический домен.
    Работает только в продакшене (DEBUG=False).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Только в продакшене
        if settings.DEBUG:
            return self.get_response(request)

        from .models import SiteSettings

        try:
            site_settings = SiteSettings.objects.first()
        except Exception:
            return self.get_response(request)

        if not site_settings or not site_settings.canonical_host:
            return self.get_response(request)

        # Получаем текущий хост из запроса
        current_host = request.get_host().split(':')[0]  # Без порта
        canonical_host = site_settings.canonical_host.strip().lower()

        # Whitelist для локальных адресов
        whitelist = ['127.0.0.1', 'localhost', '0.0.0.0']

        if current_host in whitelist:
            return self.get_response(request)

        # Если хост не канонический — редирект 301
        if current_host != canonical_host:
            protocol = 'https' if request.is_secure() else 'http'
            new_url = f"{protocol}://{canonical_host}{request.get_full_path()}"
            return HttpResponsePermanentRedirect(new_url)

        return self.get_response(request)
