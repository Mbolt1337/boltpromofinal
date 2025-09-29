from rest_framework import generics, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.conf import settings
import time

from .models import Store, Category, PromoCode, Banner, StaticPage, Partner, ContactMessage
from .serializers import (
    StoreSerializer, StoreDetailSerializer, CategorySerializer, 
    PromoCodeSerializer, BannerSerializer, StaticPageSerializer, 
    PartnerSerializer, ContactMessageSerializer
)
from .filters import PromoCodeFilter


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
    """ИСПРАВЛЕНО: Список всех активных категорий БЕЗ пагинации"""
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    # КРИТИЧНО: Отключаем пагинацию для категорий
    pagination_class = None
    
    def get_queryset(self):
        """Получаем ВСЕ активные категории"""
        return Category.objects.filter(is_active=True).order_by('name')
    
    def list(self, request, *args, **kwargs):
        """ИСПРАВЛЕНО: Возвращаем все категории в формате пагинации для совместимости"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Возвращаем в формате DRF пагинации для совместимости с frontend
        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })


class CategoryDetailView(generics.RetrieveAPIView):
    """Детальная информация о категории"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


# ИСПРАВЛЕНО: Переписано как Class-Based View с пагинацией
class CategoryPromocodesView(generics.ListAPIView):
    """Промокоды категории с пагинацией, поиском и сортировкой"""
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, PromoCodeOrderingFilter, filters.SearchFilter]
    filterset_class = PromoCodeFilter
    ordering_fields = ['created_at', 'views_count', 'expires_at', 'is_recommended', 'is_hot']
    ordering = ['-is_recommended', '-is_hot', '-created_at']
    
    # Поиск внутри категории
    search_fields = [
        'title', 
        'description', 
        'store__name'
    ]
    
    def get_queryset(self):
        """Получаем промокоды только для указанной категории"""
        slug = self.kwargs.get('slug')
        
        try:
            category = Category.objects.get(slug=slug, is_active=True)
        except Category.DoesNotExist:
            return PromoCode.objects.none()
        
        # Базовый queryset с промокодами категории
        queryset = PromoCode.objects.filter(
            categories=category,
            is_active=True,
            expires_at__gt=timezone.now()
        ).select_related('store').prefetch_related('categories')
        
        # ИСПРАВЛЕНО: Дополнительные фильтры из query параметров
        search_query = self.request.query_params.get('search', None)
        if search_query:
            # Поиск внутри категории
            search_terms = search_query.lower().strip().split()
            search_q = Q()
            
            for term in search_terms:
                # ИСПРАВЛЕНО: Используем только поля которые точно есть
                term_q = (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(store__name__icontains=term)
                )
                
                # Безопасно добавляем поиск по discount_label если поле существует
                if hasattr(PromoCode, 'discount_label'):
                    term_q |= Q(discount_label__icontains=term)
                
                search_q &= term_q
            
            if search_q:
                queryset = queryset.filter(search_q).distinct()
        
        # Фильтры
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
        """Переопределяем list для добавления информации о категории"""
        slug = self.kwargs.get('slug')
        
        try:
            category = Category.objects.get(slug=slug, is_active=True)
        except Category.DoesNotExist:
            return Response({'error': 'Категория не найдена'}, status=404)
        
        # Получаем стандартный paginated response
        response = super().list(request, *args, **kwargs)
        
        # Добавляем информацию о категории в response
        response.data['category'] = CategorySerializer(category).data
        
        return response


# DEPRECATED: Старая view, оставляем для совместимости
@api_view(['GET'])
def category_promocodes(request, slug):
    """
    DEPRECATED: Используйте CategoryPromocodesView
    Получить промокоды категории (без пагинации)
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
        return Response({'error': 'Категория не найдена'}, status=404)


class StoreListView(generics.ListAPIView):
    """ИСПРАВЛЕНО: Простое решение для списка магазинов"""
    serializer_class = StoreSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['-rating', 'name']
    
    def get_queryset(self):
        """Получаем все активные магазины"""
        return Store.objects.filter(is_active=True)


class StoreDetailView(generics.RetrieveAPIView):
    """Детальная информация о магазине"""
    queryset = Store.objects.filter(is_active=True)
    serializer_class = StoreDetailSerializer
    lookup_field = 'slug'


# ИСПРАВЛЕНО: Аналогично переписываем store_promocodes как Class-Based View
class StorePromocodesView(generics.ListAPIView):
    """Промокоды магазина с пагинацией, поиском и сортировкой"""
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, PromoCodeOrderingFilter, filters.SearchFilter]
    filterset_class = PromoCodeFilter
    ordering_fields = ['created_at', 'views_count', 'expires_at', 'is_recommended', 'is_hot']
    ordering = ['-is_recommended', '-is_hot', '-created_at']
    
    search_fields = [
        'title', 
        'description', 
        'long_description',
        'categories__name',
        'discount_label'
    ]
    
    def get_queryset(self):
        """Получаем промокоды только для указанного магазина"""
        slug = self.kwargs.get('slug')
        
        try:
            store = Store.objects.get(slug=slug, is_active=True)
        except Store.DoesNotExist:
            return PromoCode.objects.none()
        
        # Базовый queryset с промокодами магазина
        queryset = store.promocodes.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).prefetch_related('categories')
        
        # Дополнительные фильтры
        search_query = self.request.query_params.get('search', None)
        if search_query:
            search_terms = search_query.lower().strip().split()
            search_q = Q()
            
            for term in search_terms:
                # ИСПРАВЛЕНО: Используем только поля которые точно есть
                term_q = (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(categories__name__icontains=term)
                )
                
                # Безопасно добавляем поиск по discount_label если поле существует
                if hasattr(PromoCode, 'discount_label'):
                    term_q |= Q(discount_label__icontains=term)
                
                search_q &= term_q
            
            if search_q:
                queryset = queryset.filter(search_q).distinct()
        
        # Остальные фильтры
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
        """Переопределяем list для добавления информации о магазине"""
        slug = self.kwargs.get('slug')
        
        try:
            store = Store.objects.get(slug=slug, is_active=True)
        except Store.DoesNotExist:
            return Response({'error': 'Магазин не найден'}, status=404)
        
        # Получаем стандартный paginated response
        response = super().list(request, *args, **kwargs)
        
        # Добавляем информацию о магазине в response
        response.data['store'] = StoreDetailSerializer(store).data
        
        return response


# DEPRECATED: Старая view для совместимости
@api_view(['GET'])
def store_promocodes(request, slug):
    """
    DEPRECATED: Используйте StorePromocodesView
    Получить промокоды магазина (без пагинации)
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
        return Response({'error': 'Магазин не найден'}, status=404)


@api_view(['GET'])
def store_stats(request, slug):
    """Статистика магазина"""
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
        return Response({'error': 'Магазин не найден'}, status=404)


class PromoCodeListView(generics.ListAPIView):
    """List active promo codes with filtering and ordering."""
    pagination_class = PromoCodePagination
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, PromoCodeOrderingFilter, filters.SearchFilter]
    filterset_class = PromoCodeFilter
    ordering_fields = ['created_at', 'views_count', 'expires_at', 'is_recommended', 'is_hot']
    # ИСПРАВЛЕНО: Улучшенная сортировка для поиска - рекомендуемые и горячие первыми
    ordering = ['-is_recommended', '-is_hot', '-created_at']
    
    # ИСПРАВЛЕНО: Поля поиска - только те что точно есть в модели
    search_fields = [
        'title', 
        'description', 
        'store__name', 
        'categories__name'
    ]
    
    def get_queryset(self):
        queryset = PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).select_related('store').prefetch_related('categories')
        
        # ИСПРАВЛЕНО: Улучшенная обработка поискового запроса
        search_query = self.request.query_params.get('search', None)
        if search_query:
            # Нормализуем поисковый запрос
            search_terms = search_query.lower().strip().split()
            
            # Создаем Q объект для поиска по всем терминам
            search_q = Q()
            for term in search_terms:
                # ИСПРАВЛЕНО: Используем только поля которые точно есть
                term_q = (
                    Q(title__icontains=term) |
                    Q(description__icontains=term) |
                    Q(store__name__icontains=term) |
                    Q(categories__name__icontains=term)
                )
                
                # Безопасно добавляем поиск по discount_label если поле существует
                if hasattr(PromoCode, 'discount_label'):
                    term_q |= Q(discount_label__icontains=term)
                
                search_q &= term_q  # И логическое - все термины должны быть найдены
            
            if search_q:
                queryset = queryset.filter(search_q).distinct()
        
        # Дополнительные фильтры из query параметров
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        store = self.request.query_params.get('store', None)
        if store:
            queryset = queryset.filter(store__slug=store)
        
        is_hot = self.request.query_params.get('is_hot', None)
        if is_hot and is_hot.lower() == 'true':
            queryset = queryset.filter(is_hot=True)
        
        # Фильтр по рекомендуемым
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
    """Список всех активных баннеров"""
    queryset = Banner.objects.filter(is_active=True).order_by('sort_order', '-created_at')
    serializer_class = BannerSerializer


class PartnerListView(generics.ListAPIView):
    """Список всех активных партнеров"""
    queryset = Partner.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = PartnerSerializer


class StaticPageDetailView(generics.RetrieveAPIView):
    """Получение статической страницы"""
    queryset = StaticPage.objects.filter(is_active=True)
    serializer_class = StaticPageSerializer
    lookup_field = 'slug'


@api_view(['POST'])
def increment_promo_views(request, promo_id):
    """Увеличить счетчик просмотров промокода"""
    try:
        promo = PromoCode.objects.get(id=promo_id, is_active=True)
        promo.increment_views()
        return Response({'success': True, 'views': promo.views})
    except PromoCode.DoesNotExist:
        return Response({'error': 'Промокод не найден'}, status=404)


# НОВОЕ: API для глобального поиска по всем сущностям
@api_view(['GET'])
def global_search(request):
    """Глобальный поиск по промокодам, магазинам и категориям"""
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
    
    # Поиск по промокодам - ИСПРАВЛЕНО: убрали несуществующие поля
    promocodes = PromoCode.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(store__name__icontains=query) |
        Q(categories__name__icontains=query),
        is_active=True,
        expires_at__gt=timezone.now()
    ).select_related('store').prefetch_related('categories').distinct()[:limit]
    
    # Поиск по магазинам
    stores = Store.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query),
        is_active=True
    )[:limit]
    
    # Поиск по категориям
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
    """API для отправки сообщений обратной связи"""
    
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def create(self, request, *args, **kwargs):
        """Переопределяем метод создания для дополнительной обработки"""
        
        # Базовая защита от спама - проверяем частоту запросов
        client_ip = self.get_client_ip(request)
        recent_messages = ContactMessage.objects.filter(
            ip_address=client_ip,
            created_at__gte=timezone.now() - timezone.timedelta(minutes=5)
        ).count()
        
        # Если больше 3 сообщений за 5 минут - блокируем
        if recent_messages >= 3:
            return Response({
                'success': False,
                'error': 'Слишком много сообщений. Попробуйте позже.',
                'error_code': 'RATE_LIMIT_EXCEEDED'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Создаем сериализатор с контекстом запроса
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Сохраняем сообщение
            try:
                message = serializer.save()
                
                # Возвращаем успешный ответ
                return Response({
                    'success': True,
                    'message': 'Сообщение успешно отправлено',
                    'data': {
                        'id': message.id,
                        'created_at': message.created_at,
                        'status': 'sent'
                    }
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Логируем ошибку (в продакшене нужно добавить proper logging)
                return Response({
                    'success': False,
                    'error': 'Произошла ошибка при сохранении сообщения',
                    'error_code': 'INTERNAL_ERROR'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        else:
            # Возвращаем ошибки валидации в удобном формате
            errors = {}
            for field, field_errors in serializer.errors.items():
                if isinstance(field_errors, list):
                    errors[field] = field_errors[0]  # Берем первую ошибку
                else:
                    errors[field] = str(field_errors)
            
            return Response({
                'success': False,
                'error': 'Ошибка валидации данных',
                'errors': errors,
                'error_code': 'VALIDATION_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Получение IP адреса клиента с учетом прокси"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_serializer_context(self):
        """Добавляем request в контекст сериализатора"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# Дополнительная view для статистики сообщений (для админов)
@api_view(['GET'])
def contact_stats(request):
    """Статистика сообщений обратной связи (только для staff)"""
    
    # Простая проверка прав (в продакшене нужна более серьезная авторизация)
    if not request.user.is_staff:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Подсчитываем статистику
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
    """Глобальная статистика включая неактивные записи"""
    try:
        # Полная статистика (включая неактивные)
        total_stores = Store.objects.count()
        total_promocodes = PromoCode.objects.count()
        total_categories = Category.objects.count()
        
        # Статистика только активных
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
        # В случае ошибки возвращаем базовые данные
        return Response({
            'total_stores': 0,
            'total_promocodes': 0,
            'total_categories': 0,
            'active_stores': 0,
            'active_promocodes': 0,
            'active_categories': 0
        }, status=500)


# НОВОЕ: Health Check для мониторинга системы
@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Health check для мониторинга системы
    GET /api/v1/health/
    """
    start_time = time.time()
    
    health_data = {
        'status': 'ok',
        'timestamp': int(time.time()),
        'environment': 'development' if settings.DEBUG else 'production',
        'version': '1.0.0'
    }
    
    # Проверка подключения к базе данных
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_data['database'] = 'ok'
        
        # Дополнительная проверка - считаем активные записи
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
    
    # Время ответа
    response_time = round((time.time() - start_time) * 1000, 2)
    health_data['response_time_ms'] = response_time
    
    status_code = 200 if health_data['status'] == 'ok' else 503
    return JsonResponse(health_data, status=status_code)
