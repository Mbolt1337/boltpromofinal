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


@shared_task(bind=True, max_retries=3, soft_time_limit=30, time_limit=60)
def flush_cache(self, scope='all'):
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


@shared_task(bind=True, max_retries=3, soft_time_limit=120, time_limit=180)
def aggregate_events_hourly(self):
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

        from django.db.models import F

        for group in groups:
            # Используем get_or_create для определения существования записи
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

            # Если запись уже существовала, обновляем атомарно через F()
            if not created:
                DailyAgg.objects.filter(pk=obj.pk).update(
                    count=F('count') + group['total'],
                    unique_count=F('unique_count') + group['unique']
                )

            aggregated += 1

        logger.info(f"Events aggregated: {aggregated} groups processed")
        return {'status': 'success', 'aggregated': aggregated}

    except Exception as e:
        logger.error(f"Event aggregation error: {str(e)}")
        # Retry с экспоненциальной задержкой
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=2, soft_time_limit=300, time_limit=600)
def cleanup_old_events(self, days=30):
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


@shared_task(bind=True, max_retries=2, soft_time_limit=60, time_limit=120)
def regenerate_sitemap(self):
    """
    Регенерация sitemap.xml и пинг поисковиков
    Логирует результаты в logs/seo_audit.log
    """
    import requests
    from django.conf import settings
    from .models import SiteSettings
    import os
    from datetime import datetime

    # Создаём директорию logs если её нет
    log_dir = os.path.join(settings.BASE_DIR.parent, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'seo_audit.log')

    def log_to_file(message):
        """Логирование в файл с timestamp"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {message}\n")

    try:
        # Получаем canonical host из настроек
        site_settings = SiteSettings.objects.first()
        host = site_settings.canonical_host if site_settings and site_settings.canonical_host else 'boltpromo.ru'
        sitemap_url = f"https://{host}/sitemap.xml"

        log_to_file(f"[SITEMAP] Regeneration started for {sitemap_url}")
        logger.info(f"Sitemap regeneration started: {sitemap_url}")

        # Sitemap генерируется автоматически Django при обращении к /sitemap.xml
        # Мы только пингуем поисковики

        results = []

        # 1. Пингуем Google
        try:
            google_ping_url = f"https://www.google.com/ping?sitemap={sitemap_url}"
            response = requests.get(google_ping_url, timeout=10)
            if response.status_code == 200:
                log_to_file(f"[GOOGLE PING] SUCCESS - Status: {response.status_code}")
                results.append(f"Google ping: SUCCESS ({response.status_code})")
            else:
                log_to_file(f"[GOOGLE PING] WARNING - Status: {response.status_code}")
                results.append(f"Google ping: WARNING ({response.status_code})")
        except Exception as e:
            log_to_file(f"[GOOGLE PING] ERROR - {str(e)}")
            results.append(f"Google ping: ERROR ({str(e)})")

        # 2. Пингуем Яндекс через IndexNow API
        try:
            yandex_ping_url = f"https://yandex.ru/indexnow?url={sitemap_url}"
            response = requests.get(yandex_ping_url, timeout=10)
            if response.status_code in [200, 202]:
                log_to_file(f"[YANDEX PING] SUCCESS - Status: {response.status_code}")
                results.append(f"Yandex ping: SUCCESS ({response.status_code})")
            else:
                log_to_file(f"[YANDEX PING] WARNING - Status: {response.status_code}")
                results.append(f"Yandex ping: WARNING ({response.status_code})")
        except Exception as e:
            log_to_file(f"[YANDEX PING] ERROR - {str(e)}")
            results.append(f"Yandex ping: ERROR ({str(e)})")

        log_to_file(f"[SITEMAP] Regeneration completed - Results: {'; '.join(results)}")
        logger.info(f"Sitemap regeneration completed: {results}")

        return {'status': 'success', 'sitemap_url': sitemap_url, 'ping_results': results}

    except Exception as e:
        error_msg = f"Sitemap regeneration error: {str(e)}"
        log_to_file(f"[SITEMAP] FATAL ERROR - {error_msg}")
        logger.error(error_msg)
        return {'status': 'error', 'message': str(e)}


@shared_task(bind=True, max_retries=2, soft_time_limit=120, time_limit=180)
def cleanup_redis_dedup_keys(self):
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


@shared_task(bind=True, max_retries=1, soft_time_limit=300, time_limit=600)
def generate_site_assets(self, asset_id):
    """
    Генерация производных медиа-файлов из исходников
    Требует: Pillow
    """
    from .models import SiteAssets
    from django.conf import settings
    import os
    
    try:
        from PIL import Image
    except ImportError:
        logger.error('Pillow не установлен. Установите: pip install Pillow')
        return {'status': 'error', 'message': 'Pillow not installed'}
    
    try:
        asset = SiteAssets.objects.get(id=asset_id)
        media_root = settings.MEDIA_ROOT
        results = []
        
        # 1. Генерация favicon (16, 32, ico)
        if asset.favicon_src:
            src_path = asset.favicon_src.path
            img = Image.open(src_path).convert('RGBA')
            
            # favicon-16.png
            favicon_16 = img.copy().resize((16, 16), Image.Resampling.LANCZOS)
            favicon_16_path = os.path.join(media_root, 'site_assets/generated/favicon-16.png')
            os.makedirs(os.path.dirname(favicon_16_path), exist_ok=True)
            favicon_16.save(favicon_16_path, 'PNG')
            asset.favicon_16_path = 'site_assets/generated/favicon-16.png'
            results.append('✓ favicon-16.png')
            
            # favicon-32.png
            favicon_32 = img.copy().resize((32, 32), Image.Resampling.LANCZOS)
            favicon_32_path = os.path.join(media_root, 'site_assets/generated/favicon-32.png')
            favicon_32.save(favicon_32_path, 'PNG')
            asset.favicon_32_path = 'site_assets/generated/favicon-32.png'
            results.append('✓ favicon-32.png')
            
            # favicon.ico (multi-size)
            favicon_ico_path = os.path.join(media_root, 'site_assets/generated/favicon.ico')
            img.save(favicon_ico_path, format='ICO', sizes=[(16,16), (32,32), (48,48)])
            asset.favicon_ico_path = 'site_assets/generated/favicon.ico'
            results.append('✓ favicon.ico')
        
        # 2. Apple Touch Icon (180×180)
        if asset.apple_touch_icon_src:
            src_path = asset.apple_touch_icon_src.path
            img = Image.open(src_path).convert('RGBA')
            apple_icon = img.copy().resize((180, 180), Image.Resampling.LANCZOS)
            apple_path = os.path.join(media_root, 'site_assets/generated/apple-touch-icon.png')
            os.makedirs(os.path.dirname(apple_path), exist_ok=True)
            apple_icon.save(apple_path, 'PNG')
            asset.apple_touch_icon_path = 'site_assets/generated/apple-touch-icon.png'
            results.append('✓ apple-touch-icon.png')
        
        # 3. PWA иконки (192, 512, maskable)
        if asset.pwa_icon_src:
            src_path = asset.pwa_icon_src.path
            img = Image.open(src_path).convert('RGBA')
            
            # icon-192.png
            pwa_192 = img.copy().resize((192, 192), Image.Resampling.LANCZOS)
            pwa_192_path = os.path.join(media_root, 'site_assets/generated/icon-192.png')
            pwa_192.save(pwa_192_path, 'PNG')
            asset.pwa_192_path = 'site_assets/generated/icon-192.png'
            results.append('✓ icon-192.png')
            
            # icon-512.png
            pwa_512 = img.copy().resize((512, 512), Image.Resampling.LANCZOS)
            pwa_512_path = os.path.join(media_root, 'site_assets/generated/icon-512.png')
            pwa_512.save(pwa_512_path, 'PNG')
            asset.pwa_512_path = 'site_assets/generated/icon-512.png'
            results.append('✓ icon-512.png')
            
            # maskable-icon-512.png (с padding для safe area)
            maskable = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
            pwa_resized = img.copy().resize((410, 410), Image.Resampling.LANCZOS)
            maskable.paste(pwa_resized, (51, 51))
            maskable_path = os.path.join(media_root, 'site_assets/generated/maskable-icon-512.png')
            maskable.save(maskable_path, 'PNG')
            asset.pwa_maskable_path = 'site_assets/generated/maskable-icon-512.png'
            results.append('✓ maskable-icon-512.png')
        
        # Обновляем timestamp
        asset.last_generated_at = timezone.now()
        asset.save()
        
        logger.info(f'Generated site assets: {", ".join(results)}')
        return {'status': 'success', 'files': results}
        
    except Exception as e:
        logger.error(f'Error generating site assets: {str(e)}', exc_info=True)
        return {'status': 'error', 'message': str(e)}


@shared_task(bind=True, max_retries=2, soft_time_limit=120, time_limit=180)
def update_auto_hot_promos(self):
    """
    Автоматическая установка флага is_hot для промокодов:
    - Активные и не просроченные
    - Истекают менее чем через 72 часа
    - Имеют рост кликов за последние 7 дней

    Запускать каждый час
    """
    from .models import PromoCode, DailyAgg
    from django.db.models import Sum, Q

    try:
        now = timezone.now()
        hot_threshold = now + timedelta(hours=72)
        week_ago = (now - timedelta(days=7)).date()

        # Сбрасываем is_hot у всех, кто больше не соответствует критериям
        PromoCode.objects.filter(is_hot=True).filter(
            Q(is_active=False) | Q(expires_at__lte=now) | Q(expires_at__gt=hot_threshold)
        ).update(is_hot=False)

        # Находим кандидатов на is_hot
        candidates = PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=now,
            expires_at__lte=hot_threshold
        )

        updated_count = 0

        for promo in candidates:
            # Проверяем рост кликов за последние 7 дней
            clicks_7d = DailyAgg.objects.filter(
                promo_id=promo.id,
                event_type='click',
                date__gte=week_ago
            ).aggregate(total=Sum('count'))['total'] or 0

            # Если есть хоть какие-то клики за неделю - делаем горячим
            if clicks_7d > 0:
                if not promo.is_hot:
                    promo.is_hot = True
                    promo.save(update_fields=['is_hot'])
                    updated_count += 1

        logger.info(f"Auto-hot updated: {updated_count} promos marked as hot")
        return {'status': 'success', 'updated': updated_count}

    except Exception as e:
        logger.error(f'Error updating auto-hot promos: {str(e)}')
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
