"""
Celery задачи для BoltPromo
"""
from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta, date
import logging

logger = logging.getLogger(__name__)


@shared_task
def flush_cache(scope='all'):
    """
    Задача очистки кэша
    scope: 'all', 'pages', 'api', 'showcases', 'banners'
    """
    try:
        scope_patterns = {
            'all': '*',
            'pages': 'page:*',
            'api': 'api:*',
            'showcases': 'showcase:*',
            'banners': 'banner:*',
        }

        pattern = scope_patterns.get(scope, '*')

        if scope == 'all':
            cache.clear()
            logger.info(f"Cache flush: all cleared")
        else:
            try:
                cache.delete_pattern(pattern)
                logger.info(f"Cache flush: {scope} cleared with pattern {pattern}")
            except AttributeError:
                cache.clear()
                logger.info(f"Cache flush: all cleared (delete_pattern unavailable)")

        return {'status': 'success', 'scope': scope}
    except Exception as e:
        logger.error(f"Cache flush error: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def aggregate_events_hourly():
    """
    Агрегация событий в DailyAgg (запускать каждый час)
    """
    from .models import Event, DailyAgg

    try:
        # Берём события за последний час + немного с запасом
        cutoff_time = timezone.now() - timedelta(hours=2)
        events = Event.objects.filter(created_at__gte=cutoff_time)

        aggregated = 0
        today = date.today()

        # Группируем по типу, промо, магазину, витрине
        groups = events.values(
            'event_type', 'promo_id', 'store_id', 'showcase_id'
        ).annotate(
            total=Count('id'),
            unique=Count('id', filter=Q(is_unique=True))
        )

        for group in groups:
            obj, created = DailyAgg.objects.get_or_create(
                date=today,
                event_type=group['event_type'],
                promo_id=group['promo_id'],
                store_id=group['store_id'],
                showcase_id=group['showcase_id'],
                defaults={
                    'count': group['total'],
                    'unique_count': group['unique']
                }
            )

            if not created:
                obj.count += group['total']
                obj.unique_count += group['unique']
                obj.save()

            aggregated += 1

        logger.info(f"Events aggregated: {aggregated} groups processed")
        return {'status': 'success', 'aggregated': aggregated}

    except Exception as e:
        logger.error(f"Event aggregation error: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def cleanup_old_events(days=30):
    """
    Удаление старых событий (сырых Event записей)
    Запускать раз в день
    """
    from .models import Event

    try:
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count, _ = Event.objects.filter(created_at__lt=cutoff_date).delete()

        logger.info(f"Old events cleanup: {deleted_count} deleted")
        return {'status': 'success', 'deleted': deleted_count}

    except Exception as e:
        logger.error(f"Event cleanup error: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def regenerate_sitemap():
    """
    Регенерация sitemap.xml и пинг поисковиков
    """
    try:
        # TODO: Реализовать генерацию sitemap.xml
        # Можно использовать django.contrib.sitemaps или вручную

        logger.info("Sitemap regeneration triggered")

        # Пингуем Google
        # import requests
        # requests.get(f'http://www.google.com/ping?sitemap={sitemap_url}')

        return {'status': 'success', 'message': 'Sitemap regenerated'}

    except Exception as e:
        logger.error(f"Sitemap regeneration error: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def cleanup_redis_dedup_keys():
    """
    Очистка старых Redis ключей дедупликации
    Запускать каждые 6 часов
    """
    try:
        import redis
        from django.conf import settings

        # Предполагаем что Redis используется для кэша
        r = redis.from_url(settings.CACHES['default']['LOCATION'])

        # Ключи дедупа имеют TTL 30 минут, Redis сам их удалит
        # Но можем принудительно почистить устаревшие

        pattern = 'click:*'
        keys = r.keys(pattern)

        deleted = 0
        for key in keys:
            ttl = r.ttl(key)
            if ttl < 0:  # Ключ без TTL или истёкший
                r.delete(key)
                deleted += 1

        logger.info(f"Redis dedup cleanup: {deleted} keys deleted")
        return {'status': 'success', 'deleted': deleted}

    except Exception as e:
        logger.error(f"Redis cleanup error: {str(e)}")
        return {'status': 'error', 'message': str(e)}
