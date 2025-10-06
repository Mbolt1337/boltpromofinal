"""
Analytics и Tracking views
"""
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponse
from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from datetime import date, timedelta
from ipware import get_client_ip
from django_ratelimit.decorators import ratelimit
import json
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
@ratelimit(key='ip', rate='60/m', block=True, method=['POST'])
def track_events(request):
    """
    POST /api/v1/track/
    Принимает батч событий для трекинга
    Body: {"events": [{event_type, promo_id?, store_id?, showcase_id?, session_id?, ref?, utm_*?}]}
    """
    try:
        from django.core.cache import cache
        from .models import Event

        data = json.loads(request.body)
        events_data = data.get('events', [])

        if not events_data:
            return JsonResponse({'error': 'No events provided'}, status=400)

        # Получаем IP и User-Agent (безопасно через django-ipware)
        client_ip, is_routable = get_client_ip(request)
        if client_ip is None:
            client_ip = 'unknown'
            logger.warning('Could not determine client IP for analytics event')

        user_agent = request.META.get('HTTP_USER_AGENT', '')

        created_count = 0

        # Атомарная транзакция для всех событий
        with transaction.atomic():
            for event_data in events_data:
                event_type = event_data.get('event_type')
                if not event_type:
                    continue

                promo_id = event_data.get('promo_id')
                store_id = event_data.get('store_id')
                showcase_id = event_data.get('showcase_id')
                session_id = event_data.get('session_id', '')

                # Redis дедупликация (30 минут)
                dedup_key = f"click:{event_type}:{promo_id}:{session_id}"
                is_unique = False

                if session_id:
                    if not cache.get(dedup_key):
                        cache.set(dedup_key, '1', timeout=1800)  # 30 min
                        is_unique = True

                # Создаём событие
                Event.objects.create(
                    event_type=event_type,
                    promo_id=promo_id,
                    store_id=store_id,
                    showcase_id=showcase_id,
                    session_id=session_id,
                    client_ip=client_ip,
                    user_agent=user_agent,
                    ref=event_data.get('ref', ''),
                    utm_source=event_data.get('utm_source', ''),
                    utm_medium=event_data.get('utm_medium', ''),
                    utm_campaign=event_data.get('utm_campaign', ''),
                    is_unique=is_unique
                )

                created_count += 1

        return HttpResponse(status=204)

    except Exception as e:
        logger.error(f"Track events error: {str(e)}")
        return JsonResponse({'error': 'Internal error'}, status=500)


@api_view(['GET'])
def stats_top_promos(request):
    """GET /api/v1/stats/top-promos?range=7d"""
    from django.core.cache import cache
    from .models import DailyAgg, Event

    try:
        range_param = request.GET.get('range', '7d')
        cache_key = f"stats:top_promos:{range_param}"
        cached = cache.get(cache_key)
        if cached:
            return Response({'results': cached, 'count': len(cached)})

        days = int(range_param.replace('d', ''))
        start_date = date.today() - timedelta(days=days)

        # Топ-10 промокодов по кликам
        from django.db.models import Sum

        # Всегда используем свежие данные из Event для актуальности
        # (особенно важно для сегодняшних событий)
        if False:  # Отключаем агрегированные данные, всегда берем свежие
            # Используем агрегированные данные из DailyAgg
            CLICK_EVENT_TYPES = [
                'copy', 'open',                   # основные типы
                'promo_copy', 'promo_open',       # промокоды
                'finance_open',                   # финансовые предложения
                'deal_open',                      # акции
                'click', 'copy_code'              # legacy типы
            ]

            top = DailyAgg.objects.filter(
                date__gte=start_date,
                event_type__in=CLICK_EVENT_TYPES,
                promo__isnull=False
            ).values('promo_id', 'promo__title').annotate(
                total_clicks=Sum('count')
            ).order_by('-total_clicks')[:10]

            data = [{'promo_id': item['promo_id'], 'title': item['promo__title'], 'clicks': item['total_clicks']} for item in top]
        else:
            # Fallback: используем сырые события из Event
            logger.warning('No aggregated data found, using raw events')

            CLICK_EVENT_TYPES = [
                'copy', 'open',
                'promo_copy', 'promo_open',
                'finance_open', 'deal_open'
            ]

            top = Event.objects.filter(
                created_at__date__gte=start_date,
                event_type__in=CLICK_EVENT_TYPES,
                promo__isnull=False
            ).values('promo_id', 'promo__title').annotate(
                total_clicks=Count('id')
            ).order_by('-total_clicks')[:10]

            data = [{'promo_id': item['promo_id'], 'title': item['promo__title'], 'clicks': item['total_clicks']} for item in top]

        cache.set(cache_key, data, timeout=300)  # 5 min
        return Response({'results': data, 'count': len(data)})
    except Exception as e:
        logger.error(f'stats_top_promos error: {str(e)}', exc_info=True)
        return Response({'results': [], 'count': 0}, status=200)  # Empty with proper structure


@api_view(['GET'])
def stats_top_stores(request):
    """GET /api/v1/stats/top-stores?range=7d"""
    from django.core.cache import cache
    from .models import DailyAgg, Event

    try:
        range_param = request.GET.get('range', '7d')
        cache_key = f"stats:top_stores:{range_param}"
        cached = cache.get(cache_key)
        if cached:
            return Response({'results': cached, 'count': len(cached)})

        days = int(range_param.replace('d', ''))
        start_date = date.today() - timedelta(days=days)

        from django.db.models import Sum

        # Всегда используем свежие данные из Event для актуальности
        # (особенно важно для сегодняшних событий)
        if False:  # Отключаем агрегированные данные, всегда берем свежие
            top = DailyAgg.objects.filter(
                date__gte=start_date,
                store__isnull=False
            ).values('store_id', 'store__name').annotate(
                total_clicks=Sum('count')
            ).order_by('-total_clicks')[:10]

            data = [{'store_id': item['store_id'], 'name': item['store__name'], 'clicks': item['total_clicks']} for item in top]
        else:
            # Fallback: используем сырые события
            top = Event.objects.filter(
                created_at__date__gte=start_date,
                store__isnull=False
            ).values('store_id', 'store__name').annotate(
                total_clicks=Count('id')
            ).order_by('-total_clicks')[:10]

            data = [{'store_id': item['store_id'], 'name': item['store__name'], 'clicks': item['total_clicks']} for item in top]

        cache.set(cache_key, data, timeout=300)
        return Response({'results': data, 'count': len(data)})
    except Exception as e:
        logger.error(f'stats_top_stores error: {str(e)}', exc_info=True)
        return Response({'results': [], 'count': 0}, status=200)


@api_view(['GET'])
def stats_types_share(request):
    """GET /api/v1/stats/types-share?range=7d"""
    from django.core.cache import cache
    from .models import DailyAgg, Event

    try:
        range_param = request.GET.get('range', '7d')
        cache_key = f"stats:types_share:{range_param}"
        cached = cache.get(cache_key)
        if cached:
            return Response({'results': cached, 'count': len(cached)})

        days = int(range_param.replace('d', ''))
        start_date = date.today() - timedelta(days=days)

        from django.db.models import Sum

        # Всегда используем свежие данные из Event для актуальности
        # (особенно важно для сегодняшних событий)
        if False:  # Отключаем агрегированные данные, всегда берем свежие
            types = DailyAgg.objects.filter(
                date__gte=start_date,
                promo__isnull=False
            ).values('promo__offer_type').annotate(
                total=Sum('count')
            ).order_by('-total')

            data = [{'type': item['promo__offer_type'], 'count': item['total']} for item in types]
        else:
            # Fallback: используем сырые события
            types = Event.objects.filter(
                created_at__date__gte=start_date,
                promo__isnull=False
            ).values('promo__offer_type').annotate(
                total=Count('id')
            ).order_by('-total')

            data = [{'type': item['promo__offer_type'], 'count': item['total']} for item in types]

        cache.set(cache_key, data, timeout=300)
        return Response({'results': data, 'count': len(data)})
    except Exception as e:
        logger.error(f'stats_types_share error: {str(e)}', exc_info=True)
        return Response({'results': [], 'count': 0}, status=200)


@api_view(['GET'])
def stats_showcases_ctr(request):
    """GET /api/v1/stats/showcases-ctr?range=7d"""
    from django.core.cache import cache
    from .models import DailyAgg, Event

    try:
        range_param = request.GET.get('range', '7d')
        cache_key = f"stats:showcases_ctr:{range_param}"
        cached = cache.get(cache_key)
        if cached:
            return Response({'results': cached, 'count': len(cached)})

        days = int(range_param.replace('d', ''))
        start_date = date.today() - timedelta(days=days)

        from django.db.models import Sum

        # Всегда используем свежие данные из Event для актуальности
        # (особенно важно для сегодняшних событий)
        if False:  # Отключаем агрегированные данные, всегда берем свежие
            views = DailyAgg.objects.filter(
                date__gte=start_date,
                event_type='showcase_view',
                showcase__isnull=False
            ).values('showcase_id', 'showcase__title').annotate(
                views_count=Sum('count')
            )

            clicks = DailyAgg.objects.filter(
                date__gte=start_date,
                event_type='showcase_open',
                showcase__isnull=False
            ).values('showcase_id').annotate(
                clicks_count=Sum('count')
            )
        else:
            # Fallback: используем сырые события
            views = Event.objects.filter(
                created_at__date__gte=start_date,
                event_type='showcase_view',
                showcase__isnull=False
            ).values('showcase_id', 'showcase__title').annotate(
                views_count=Count('id')
            )

            clicks = Event.objects.filter(
                created_at__date__gte=start_date,
                event_type='showcase_open',
                showcase__isnull=False
            ).values('showcase_id').annotate(
                clicks_count=Count('id')
            )

        # Объединяем
        clicks_dict = {item['showcase_id']: item['clicks_count'] for item in clicks}

        data = []
        for view_item in views:
            showcase_id = view_item['showcase_id']
            views_count = view_item['views_count']
            clicks_count = clicks_dict.get(showcase_id, 0)
            ctr = (clicks_count / views_count * 100) if views_count > 0 else 0

            data.append({
                'showcase_id': showcase_id,
                'title': view_item.get('showcase__title', 'Unknown'),
                'views': views_count,
                'clicks': clicks_count,
                'ctr': round(ctr, 2)
            })

        data = sorted(data, key=lambda x: x['ctr'], reverse=True)[:10]

        cache.set(cache_key, data, timeout=300)
        return Response({'results': data, 'count': len(data)})
    except Exception as e:
        logger.error(f'stats_showcases_ctr error: {str(e)}', exc_info=True)
        return Response({'results': [], 'count': 0}, status=200)
