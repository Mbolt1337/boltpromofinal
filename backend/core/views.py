from rest_framework import generics, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Prefetch
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from ipware import get_client_ip as get_client_ip_safe
import time
import logging

logger = logging.getLogger(__name__)

# Import cache utilities for API response caching
from .utils.cache import cache_api_response

from .models import Store, Category, PromoCode, Banner, StaticPage, Partner, ContactMessage, Showcase, ShowcaseItem
from .serializers import (
    StoreSerializer, StoreDetailSerializer, CategorySerializer,
    PromoCodeSerializer, BannerSerializer, StaticPageSerializer,
    PartnerSerializer, ContactMessageSerializer, ShowcaseListSerializer, ShowcaseDetailSerializer
)
from .filters import PromoCodeFilter, PromoCodeOrderingFilter


class PromoCodePagination(PageNumberPagination):
    """Pagination for promo codes with optional `limit` query support."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_page_size(self, request):
        limit = request.query_params.get('limit')
        if limit is not None:
            try:
                limit_value = int(limit)
                if limit_value > 0:
                    return min(limit_value, self.max_page_size)
            except (TypeError, ValueError):
                pass
        return super().get_page_size(request)

class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by('name')

    @cache_api_response(ttl=3600)  # 60 minutes cache for categories (rarely change)
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class CategoryPromocodesView(generics.ListAPIView):
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, PromoCodeOrderingFilter, filters.SearchFilter]
    filterset_class = PromoCodeFilter
    ordering_fields = ['created_at', 'views_count', 'expires_at', 'is_recommended', 'is_hot', 'popular']
    ordering = ['-is_recommended', '-is_hot', '-created_at']
    
    search_fields = [
        'title', 
        'description', 
        'store__name'
    ]
    
    def get_queryset(self):
        slug = self.kwargs.get('slug')

        category = Category.objects.filter(slug=slug, is_active=True).first()

        if not category:
            return PromoCode.objects.none()

        queryset = PromoCode.objects.filter(
            categories=category,
            is_active=True,
            expires_at__gt=timezone.now()
        ).select_related('store').prefetch_related(
            Prefetch('categories', queryset=Category.objects.filter(is_active=True))
        )

        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_terms = search_query.lower().strip().split()
            search_q = Q()
            
            for term in search_terms:
                term_q = (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(store__name__icontains=term)
                )
                
                if hasattr(PromoCode, 'discount_label'):
                    term_q |= Q(discount_label__icontains=term)
                
                search_q &= term_q
            
            if search_q:
                queryset = queryset.filter(search_q).distinct()
        
        store = self.request.query_params.get('store', None)
        if store:
            queryset = queryset.filter(store__slug=store)
        
        is_hot = self.request.query_params.get('is_hot', None)
        if is_hot and is_hot.lower() == 'true':
            queryset = queryset.filter(is_hot=True)
        
        is_recommended = self.request.query_params.get('is_recommended', None)
        if is_recommended and is_recommended.lower() == 'true':
            queryset = queryset.filter(is_recommended=True)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        slug = self.kwargs.get('slug')
        
        try:
            category = Category.objects.get(slug=slug, is_active=True)
        except Category.DoesNotExist:
            return Response({'error': 'API endpoint'}, status=404)
        
        response = super().list(request, *args, **kwargs)
        
        response.data['category'] = CategorySerializer(category).data
        
        return response


@api_view(['GET'])
def category_promocodes(request, slug):
    """
    """
    try:
        category = Category.objects.get(slug=slug, is_active=True)
        promocodes = PromoCode.objects.filter(
            categories=category, 
            is_active=True,
            expires_at__gt=timezone.now()
        ).select_related('store').prefetch_related('categories').order_by('-is_recommended', '-created_at')
        
        serializer = PromoCodeSerializer(promocodes, many=True)
        return Response({
            'category': CategorySerializer(category).data,
            'promocodes': serializer.data,
            'count': promocodes.count()
        })
    except Category.DoesNotExist:
        return Response({'error': 'API endpoint'}, status=404)


class StoreListView(generics.ListAPIView):
    serializer_class = StoreSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['-rating', 'name']
    
    def get_queryset(self):
        return Store.objects.filter(is_active=True)


class StoreDetailView(generics.RetrieveAPIView):
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreDetailSerializer
    lookup_field = 'slug'


class StorePromocodesView(generics.ListAPIView):
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, PromoCodeOrderingFilter, filters.SearchFilter]
    filterset_class = PromoCodeFilter
    ordering_fields = ['created_at', 'views_count', 'expires_at', 'is_recommended', 'is_hot', 'popular']
    ordering = ['-is_recommended', '-is_hot', '-created_at']
    
    search_fields = [
        'title', 
        'description', 
        'long_description',
        'categories__name',
        'discount_label'
    ]
    
    def get_queryset(self):
        slug = self.kwargs.get('slug')
        
        try:
            store = Store.objects.get(slug=slug, is_active=True)
        except Store.DoesNotExist:
            return PromoCode.objects.none()
        
        queryset = store.promocodes.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).prefetch_related('categories')
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_terms = search_query.lower().strip().split()
            search_q = Q()
            
            for term in search_terms:
                term_q = (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(categories__name__icontains=term)
                )
                
                if hasattr(PromoCode, 'discount_label'):
                    term_q |= Q(discount_label__icontains=term)
                
                search_q &= term_q
            
            if search_q:
                queryset = queryset.filter(search_q).distinct()
        
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        is_hot = self.request.query_params.get('is_hot', None)
        if is_hot and is_hot.lower() == 'true':
            queryset = queryset.filter(is_hot=True)
        
        is_recommended = self.request.query_params.get('is_recommended', None)
        if is_recommended and is_recommended.lower() == 'true':
            queryset = queryset.filter(is_recommended=True)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        slug = self.kwargs.get('slug')
        
        try:
            store = Store.objects.get(slug=slug, is_active=True)
        except Store.DoesNotExist:
            return Response({'error': 'API endpoint'}, status=404)
        
        response = super().list(request, *args, **kwargs)
        
        response.data['store'] = StoreDetailSerializer(store).data
        
        return response


@api_view(['GET'])
def store_promocodes(request, slug):
    """
    """
    try:
        store = Store.objects.get(slug=slug, is_active=True)
        promocodes = store.promocodes.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).prefetch_related('categories').order_by('-is_recommended', '-created_at')
        
        serializer = PromoCodeSerializer(promocodes, many=True)
        return Response({
            'store': StoreDetailSerializer(store).data,
            'promocodes': serializer.data,
            'count': promocodes.count()
        })
    except Store.DoesNotExist:
        return Response({'error': 'API endpoint'}, status=404)


@api_view(['GET'])
def store_stats(request, slug):
    try:
        store = Store.objects.get(slug=slug, is_active=True)
        promocodes = store.promocodes.filter(is_active=True)
        hot_promocodes = promocodes.filter(is_hot=True)
        total_views = sum(promo.views for promo in promocodes)
        
        return Response({
            'promocodes_count': promocodes.count(),
            'active_promocodes': promocodes.count(),
            'hot_promocodes': hot_promocodes.count(),
            'total_views': total_views
        })
    except Store.DoesNotExist:
        return Response({'error': 'API endpoint'}, status=404)


class PromoCodeListView(generics.ListAPIView):
    """List active promo codes with filtering and ordering."""
    pagination_class = PromoCodePagination
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, PromoCodeOrderingFilter, filters.SearchFilter]
    filterset_class = PromoCodeFilter
    ordering_fields = ['created_at', 'views_count', 'expires_at', 'is_recommended', 'is_hot', 'popular']
    ordering = ['-is_recommended', '-is_hot', '-created_at']

    search_fields = [
        'title',
        'description',
        'store__name',
        'categories__name'
    ]

    @cache_api_response(ttl=900)  # 15 minutes cache for promo codes list
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).select_related('store').prefetch_related('categories')
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_terms = search_query.lower().strip().split()
            
            search_q = Q()
            for term in search_terms:
                term_q = (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(store__name__icontains=term) |
                    Q(categories__name__icontains=term)
                )
                
                if hasattr(PromoCode, 'discount_label'):
                    term_q |= Q(discount_label__icontains=term)
                
            
            if search_q:
                queryset = queryset.filter(search_q).distinct()
        
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        store = self.request.query_params.get('store', None)
        if store:
            queryset = queryset.filter(store__slug=store)
        
        is_hot = self.request.query_params.get('is_hot', None)
        if is_hot and is_hot.lower() == 'true':
            queryset = queryset.filter(is_hot=True)
        
        is_recommended = self.request.query_params.get('is_recommended', None)
        if is_recommended and is_recommended.lower() == 'true':
            queryset = queryset.filter(is_recommended=True)
        
        return queryset


class PromoCodeDetailView(generics.RetrieveAPIView):
    """Retrieve a single active promo code."""
    queryset = PromoCode.objects.select_related('store').prefetch_related('categories')
    serializer_class = PromoCodeSerializer

    def get_queryset(self):
        return super().get_queryset().filter(
            is_active=True,
            expires_at__gt=timezone.now()
        )

class BannerListView(generics.ListAPIView):
    queryset = Banner.objects.filter(is_active=True).order_by('sort_order', '-created_at')
    serializer_class = BannerSerializer


class PartnerListView(generics.ListAPIView):
    queryset = Partner.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = PartnerSerializer


class StaticPageDetailView(generics.RetrieveAPIView):
    queryset = StaticPage.objects.filter(is_active=True)
    serializer_class = StaticPageSerializer
    lookup_field = 'slug'


@api_view(['POST'])
def increment_promo_views(request, promo_id):
    try:
        promo = PromoCode.objects.get(id=promo_id, is_active=True)
        promo.increment_views()
        return Response({'success': True, 'views': promo.views})
    except PromoCode.DoesNotExist:
        return Response({'error': 'API endpoint'}, status=404)


@api_view(['GET'])
def global_search(request):
    query = request.query_params.get('q', '').strip()
    limit = int(request.query_params.get('limit', 10))
    
    if not query or len(query) < 2:
        return Response({
            'query': query,
            'promocodes': [],
            'stores': [],
            'categories': [],
            'total': 0
        })
    
    promocodes = PromoCode.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(store__name__icontains=query) |
        Q(categories__name__icontains=query),
        is_active=True,
        expires_at__gt=timezone.now()
    ).select_related('store').prefetch_related('categories').distinct()[:limit]
    
    stores = Store.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query),
        is_active=True
    )[:limit]
    
    categories = Category.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query),
        is_active=True
    )[:limit]
    
    return Response({
        'query': query,
        'promocodes': PromoCodeSerializer(promocodes, many=True).data,
        'stores': StoreSerializer(stores, many=True).data,
        'categories': CategorySerializer(categories, many=True).data,
        'total': len(promocodes) + len(stores) + len(categories)
    })


class ContactMessageCreateView(generics.CreateAPIView):

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    @method_decorator(ratelimit(key='ip', rate='2/m', block=True, method='POST'))
    @method_decorator(ratelimit(key='ip', rate='10/h', block=True, method='POST'))
    def post(self, request, *args, **kwargs):
        # Rate limiting через Redis (2/min и 10/hour)
        # Если превышен — django-ratelimit вернёт 429 автоматически
        return self.create(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):

        # Логируем попытку отправки
        client_ip = self.get_client_ip(request)
        
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                message = serializer.save()
                
                return Response({
                    'success': True,
                    'data': {
                        'id': message.id,
                        'created_at': message.created_at,
                        'status': 'sent'
                    }
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'error_code': 'INTERNAL_ERROR'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        else:
            errors = {}
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    errors[field] = field_errors[0]
                else:
                    errors[field] = str(field_errors)
            
            return Response({
                'success': False,
                'error': 'Validation error',
                'errors': errors,
                'error_code': 'VALIDATION_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Безопасное извлечение client IP через django-ipware"""
        client_ip, is_routable = get_client_ip_safe(request)
        return client_ip or 'unknown'
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['GET'])
def contact_stats(request):
    
    if not request.user.is_staff:
        return Response({
        }, status=status.HTTP_403_FORBIDDEN)
    
    total_messages = ContactMessage.objects.count()
    processed_messages = ContactMessage.objects.filter(is_processed=True).count()
    spam_messages = ContactMessage.objects.filter(is_spam=True).count()
    recent_messages = ContactMessage.objects.filter(
        created_at__gte=timezone.now() - timezone.timedelta(days=7)
    ).count()
    
    return Response({
        'total_messages': total_messages,
        'processed_messages': processed_messages,
        'unprocessed_messages': total_messages - processed_messages,
        'spam_messages': spam_messages,
        'recent_messages_week': recent_messages,
        'processing_rate': round((processed_messages / total_messages * 100), 2) if total_messages > 0 else 0
    })


@api_view(['GET'])
def global_stats(request):
    try:
        total_stores = Store.objects.count()
        total_promocodes = PromoCode.objects.count()
        total_categories = Category.objects.count()
        
        active_stores = Store.objects.filter(is_active=True).count()
        active_promocodes = PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).count()
        active_categories = Category.objects.filter(is_active=True).count()
        
        return Response({
            'total_stores': total_stores,
            'total_promocodes': total_promocodes,
            'total_categories': total_categories,
            'active_stores': active_stores,
            'active_promocodes': active_promocodes,
            'active_categories': active_categories
        })
    except Exception as e:
        return Response({
            'total_stores': 0,
            'total_promocodes': 0,
            'total_categories': 0,
            'active_stores': 0,
            'active_promocodes': 0,
            'active_categories': 0
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    GET /api/v1/health/
    """
    start_time = time.time()
    
    health_data = {
        'status': 'ok',
        'timestamp': int(time.time()),
        'environment': 'development' if settings.DEBUG else 'production',
        'version': '1.0.0'
    }
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_data['database'] = 'ok'
        
        active_stores = Store.objects.filter(is_active=True).count()
        active_promocodes = PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).count()
        
        health_data['data'] = {
            'active_stores': active_stores,
            'active_promocodes': active_promocodes
        }
        
    except Exception as e:
        health_data['database'] = 'error'
        health_data['database_error'] = str(e)
        health_data['status'] = 'error'
    
    response_time = round((time.time() - start_time) * 1000, 2)
    health_data['response_time_ms'] = response_time
    
    status_code = 200 if health_data['status'] == 'ok' else 503
    return JsonResponse(health_data, status=status_code)

@csrf_exempt
@require_http_methods(["GET"])
def robots_txt(request):
    """Return robots.txt - either custom from SiteSettings or default."""
    from .models import SiteSettings

    try:
        settings = SiteSettings.objects.first()
        if settings and settings.robots_txt:
            body = settings.robots_txt
        else:
            # Default robots.txt
            body = """User-Agent: *
Allow: /
Disallow: /admin/

Sitemap: {}/sitemap.xml
""".format(request.build_absolute_uri('/'))
    except Exception:
        body = "User-Agent: *\nAllow: /"

    return HttpResponse(body, content_type='text/plain')


# =============================================================================
# SHOWCASE VIEWS
# =============================================================================

from rest_framework import viewsets
from rest_framework.decorators import action
from django.db.models import Count, Prefetch


class ShowcaseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для витрин (подборок промокодов)"""
    lookup_field = 'slug'
    pagination_class = PromoCodePagination

    def get_queryset(self):
        """Возвращает активные витрины с аннотацией счетчика промокодов"""
        return Showcase.objects.filter(
            is_active=True
        ).annotate(
            promos_count=Count('items')
        ).order_by('sort_order', '-created_at')

    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'retrieve':
            return ShowcaseDetailSerializer
        return ShowcaseListSerializer

    @cache_api_response(ttl=1800)  # 30 minutes cache for showcases list
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['get'], url_path='promos')
    def promos(self, request, slug=None):
        """
        Эндпоинт для получения промокодов конкретной витрины с пагинацией
        GET /api/v1/showcases/<slug>/promos/?page=1&page_size=24
        """
        showcase = self.get_object()

        # Получаем промокоды через ShowcaseItem с нужным порядком
        showcase_items = ShowcaseItem.objects.filter(
            showcase=showcase
        ).select_related(
            'promocode',
            'promocode__store'
        ).prefetch_related(
            'promocode__categories'
        ).order_by('position', 'id')

        # Извлекаем промокоды из ShowcaseItem
        promocodes = [item.promocode for item in showcase_items]

        # Пагинация
        paginator = self.pagination_class()
        paginated_promocodes = paginator.paginate_queryset(promocodes, request, view=self)

        # Сериализация
        serializer = PromoCodeSerializer(paginated_promocodes, many=True)

        return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def site_assets_view(request):
    """
    API для получения медиа-ресурсов сайта (favicon, OG, PWA)
    GET /api/v1/site/assets/
    """
    from .models import SiteAssets
    
    try:
        assets = SiteAssets.objects.first()
        
        if not assets:
            return Response({
                'favicon_ico': None,
                'favicon_16': None,
                'favicon_32': None,
                'og_default': None,
                'twitter_default': None,
                'apple_touch_icon': None,
                'pwa_192': None,
                'pwa_512': None,
                'pwa_maskable': None,
                'safari_pinned_svg': None,
                'theme_color': '#0b1020',
                'background_color': '#0b1020',
            }, status=200)
        
        # Формируем полные URLs
        request_host = request.build_absolute_uri('/')[:-1]
        
        def make_url(field):
            if field:
                return request_host + settings.MEDIA_URL + field
            return None
        
        data = {
            'favicon_ico': make_url(assets.favicon_ico_path),
            'favicon_16': make_url(assets.favicon_16_path),
            'favicon_32': make_url(assets.favicon_32_path),
            'og_default': request_host + assets.og_default.url if assets.og_default else None,
            'twitter_default': request_host + assets.twitter_default.url if assets.twitter_default else None,
            'apple_touch_icon': make_url(assets.apple_touch_icon_path),
            'pwa_192': make_url(assets.pwa_192_path),
            'pwa_512': make_url(assets.pwa_512_path),
            'pwa_maskable': make_url(assets.pwa_maskable_path),
            'safari_pinned_svg': request_host + assets.safari_pinned_svg.url if assets.safari_pinned_svg else None,
            'theme_color': assets.theme_color,
            'background_color': assets.background_color,
        }
        
        return Response(data, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
