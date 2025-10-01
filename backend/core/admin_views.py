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

    try:
        # Запускаем Celery задачу
        from .tasks import flush_cache
        task = flush_cache.delay(scope)

        # Логируем действие
        AdminActionLog.objects.create(
            user=request.user.username,
            action=f'flush_cache_{scope}',
            details=f'Запущена задача очистки кэша: {scope} (task_id: {task.id})'
        )

        messages.success(request, f'Задача очистки кэша "{scope}" запущена.')

    except Exception as e:
        messages.error(request, f'Ошибка при запуске задачи: {str(e)}')

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
    """Регенерация sitemap через Celery"""
    try:
        from .tasks import regenerate_sitemap
        task = regenerate_sitemap.delay()

        AdminActionLog.objects.create(
            user=request.user.username,
            action='regenerate_sitemap',
            details=f'Запущена задача генерации sitemap (task_id: {task.id})'
        )

        messages.success(request, 'Задача регенерации sitemap запущена.')
    except Exception as e:
        messages.error(request, f'Ошибка: {str(e)}')

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
