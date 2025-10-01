"""
Специальные view для админских действий
"""
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.shortcuts import redirect
from django.core.cache import cache
from django.utils import timezone

from .models import SiteSettings, AdminActionLog


@staff_member_required
def flush_cache_view(request, scope='all'):
    """Сброс кэша (вызывается из админки)"""
    settings = SiteSettings.objects.first()

    if not settings or not settings.allow_admin_cache_flush:
        messages.error(request, 'Сброс кэша запрещен в настройках.')
        return redirect('admin:core_sitesettings_change', 1)

    # Определяем паттерны для очистки
    scope_patterns = {
        'all': '*',
        'pages': 'page:*',
        'api': 'api:*',
        'showcases': 'showcase:*',
        'banners': 'banner:*',
    }

    pattern = scope_patterns.get(scope, '*')

    try:
        if scope == 'all':
            cache.clear()
            cleared_msg = 'Весь кэш очищен'
        else:
            # Для паттернов используем delete_pattern если доступно (redis)
            # Иначе просто очищаем всё
            try:
                cache.delete_pattern(pattern)
                cleared_msg = f'Кэш "{scope}" очищен'
            except AttributeError:
                cache.clear()
                cleared_msg = f'Весь кэш очищен (delete_pattern недоступен)'

        # Логируем действие
        AdminActionLog.objects.create(
            user=request.user.username,
            action=f'flush_cache_{scope}',
            details=cleared_msg
        )

        messages.success(request, cleared_msg)

    except Exception as e:
        messages.error(request, f'Ошибка при очистке кэша: {str(e)}')

    return redirect('admin:core_sitesettings_change', 1)


@staff_member_required
def toggle_maintenance_view(request):
    """Переключение режима техработ"""
    settings = SiteSettings.objects.first()

    if not settings:
        messages.error(request, 'Настройки сайта не найдены.')
        return redirect('admin:index')

    settings.maintenance_enabled = not settings.maintenance_enabled
    settings.save()

    status = 'включен' if settings.maintenance_enabled else 'отключен'

    AdminActionLog.objects.create(
        user=request.user.username,
        action='toggle_maintenance',
        details=f'Режим техработ {status}'
    )

    messages.success(request, f'Режим техработ {status}.')
    return redirect('admin:core_sitesettings_change', 1)


@staff_member_required
def regenerate_sitemap_view(request):
    """Регенерация sitemap (заглушка для celery-задачи)"""
    # TODO: вызвать celery-задачу для генерации sitemap

    AdminActionLog.objects.create(
        user=request.user.username,
        action='regenerate_sitemap',
        details='Запущена задача генерации sitemap'
    )

    messages.info(request, 'Задача регенерации sitemap запущена.')
    return redirect('admin:core_sitesettings_change', 1)


@staff_member_required
def stats_dashboard_view(request):
    """Дашборд статистики"""
    from django.shortcuts import render

    context = {
        'title': 'Статистика',
        'site_header': 'BoltPromo - Статистика',
    }

    return render(request, 'admin/stats.html', context)
