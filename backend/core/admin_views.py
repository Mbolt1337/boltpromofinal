"""
Специальные view для админских действий
"""
import logging
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.shortcuts import redirect, render
from django.core.cache import cache
from django.utils import timezone

from .models import SiteSettings, AdminActionLog

logger = logging.getLogger(__name__)


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
    context = {
        'title': 'Статистика',
        'site_header': 'BoltPromo - Статистика',
    }
    return render(request, 'admin/stats.html', context)


@staff_member_required
def help_view(request):
    """Страница помощи для админки"""
    return render(request, 'admin/help.html', {
        'title': 'Помощь',
    })


@staff_member_required
def reaggregate_events_view(request):
    """
    Ручная переагрегация событий за последние N дней
    """
    from .models import AdminActionLog
    
    if request.method == 'POST':
        days = int(request.POST.get('days', 7))
        
        try:
            from .tasks import aggregate_events_hourly
            
            # Запускаем задачу
            task = aggregate_events_hourly.delay()
            task_id = task.id if hasattr(task, 'id') else 'N/A'
            
            # Логируем действие
            AdminActionLog.objects.create(
                user=request.user,
                action='reaggregate_events',
                params={'days': days},
                task_id=task_id
            )
            
            messages.success(
                request, 
                f'Запущена переагрегация событий за последние {days} дней. Task ID: {task_id}'
            )
        except Exception as e:
            logger.error(f'Reaggregate error: {str(e)}', exc_info=True)
            messages.error(
                request, 
                f'Ошибка при запуске переагрегации: {str(e)}'
            )
        
        return redirect('admin_stats_dashboard')
    
    # GET - показываем форму
    context = {
        'title': 'Переагрегация событий',
        'site_header': 'BoltPromo - Переагрегация',
        'days_options': [7, 14, 30],
    }
    return render(request, 'admin/reaggregate_form.html', context)
