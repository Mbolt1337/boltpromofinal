import django_filters
from django.utils import timezone
from django.db import models
from rest_framework.filters import OrderingFilter
from .models import PromoCode, Store, Category


class PromoCodeFilter(django_filters.FilterSet):
    """Фильтры для промокодов с поддержкой поиска и сложных фильтров"""
    
    # Базовые фильтры
    q = django_filters.CharFilter(method='search_filter', label='Поиск')
    store = django_filters.ModelChoiceFilter(queryset=Store.objects.filter(is_active=True), field_name='store__slug', to_field_name='slug')
    category = django_filters.CharFilter(field_name='categories__slug', lookup_expr='exact')
    
    # Булевые фильтры
    is_hot = django_filters.BooleanFilter()
    is_recommended = django_filters.BooleanFilter()
    
    # Дополнительные фильтры
    with_code = django_filters.BooleanFilter(method='filter_with_code', label='Только с промокодом')
    expires_soon = django_filters.BooleanFilter(method='filter_expires_soon', label='Скоро истекают')
    
    # Фильтры по диапазону дат
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')
    expires_after = django_filters.DateFilter(field_name='expires_at', lookup_expr='gte')
    expires_before = django_filters.DateFilter(field_name='expires_at', lookup_expr='lte')
    
    class Meta:
        model = PromoCode
        fields = [
            'store', 'category', 'is_hot', 'is_recommended', 
            'with_code', 'expires_soon', 'created_after', 'created_before',
            'expires_after', 'expires_before'
        ]
        # ИСПРАВЛЕНО: Убрали поля которых может не быть в модели
    
    def search_filter(self, queryset, name, value):
        """Улучшенный поиск по множественным полям"""
        if not value:
            return queryset
        
        # Нормализуем поисковый запрос
        search_terms = value.lower().strip().split()
        
        # Создаем Q объект для поиска
        search_q = models.Q()
        
        for term in search_terms:
            if len(term) < 2:  # Игнорируем слишком короткие термины
                continue
                
            # ИСПРАВЛЕНО: Используем только поля которые точно есть в модели
            term_q = (
                models.Q(title__icontains=term) |
                models.Q(description__icontains=term) |
                models.Q(store__name__icontains=term) |
                models.Q(categories__name__icontains=term)
            )
            
            # Безопасно добавляем поиск по code если поле существует
            if hasattr(PromoCode, 'code'):
                term_q |= models.Q(code__icontains=term)
            
            # Безопасно добавляем поиск по discount_label если поле существует  
            if hasattr(PromoCode, 'discount_label'):
                term_q |= models.Q(discount_label__icontains=term)
            
            search_q &= term_q  # AND логика - все термины должны быть найдены
        
        if search_q:
            return queryset.filter(search_q).distinct()
        
        return queryset
    
    def filter_with_code(self, queryset, name, value):
        """Фильтр по наличию промокода"""
        if value and hasattr(PromoCode, 'code'):
            return queryset.exclude(models.Q(code='') | models.Q(code__isnull=True))
        return queryset
    
    def filter_expires_soon(self, queryset, name, value):
        """Фильтр по скоро истекающим промокодам"""
        if value:
            from datetime import timedelta
            soon = timezone.now() + timedelta(days=7)
            return queryset.filter(
                expires_at__lte=soon, 
                expires_at__gte=timezone.now()
            )
        return queryset


# Фильтры для магазинов
class StoreFilter(django_filters.FilterSet):
    """Фильтры для магазинов"""
    
    q = django_filters.CharFilter(method='search_filter', label='Поиск')
    has_promocodes = django_filters.BooleanFilter(method='filter_has_promocodes')
    
    # ИСПРАВЛЕНО: Убираем сложные фильтры которые могут не работать
    
    class Meta:
        model = Store
        fields = ['has_promocodes']
    
    def search_filter(self, queryset, name, value):
        """Поиск по магазинам"""
        if not value:
            return queryset
        
        search_terms = value.lower().strip().split()
        search_q = models.Q()
        
        for term in search_terms:
            if len(term) < 2:
                continue
                
            term_q = (
                models.Q(name__icontains=term) |
                models.Q(description__icontains=term)
            )
            search_q &= term_q
        
        if search_q:
            return queryset.filter(search_q).distinct()
        
        return queryset
    
    def filter_has_promocodes(self, queryset, name, value):
        """Фильтр по наличию активных промокодов"""
        if value:
            return queryset.filter(
                promocodes__is_active=True,
                promocodes__expires_at__gt=timezone.now()
            ).distinct()
        return queryset


# Фильтры для категорий
class CategoryFilter(django_filters.FilterSet):
    """Фильтры для категорий"""
    
    q = django_filters.CharFilter(method='search_filter', label='Поиск')
    has_promocodes = django_filters.BooleanFilter(method='filter_has_promocodes')
    
    class Meta:
        model = Category
        fields = ['has_promocodes']
    
    def search_filter(self, queryset, name, value):
        """Поиск по категориям"""
        if not value:
            return queryset
        
        search_terms = value.lower().strip().split()
        search_q = models.Q()
        
        for term in search_terms:
            if len(term) < 2:
                continue
                
            term_q = (
                models.Q(name__icontains=term) |
                models.Q(description__icontains=term)
            )
            search_q &= term_q
        
        if search_q:
            return queryset.filter(search_q).distinct()
        
        return queryset
    
    def filter_has_promocodes(self, queryset, name, value):
        """Фильтр по наличию активных промокодов"""
        if value:
            return queryset.filter(
                promocode_set__is_active=True,
                promocode_set__expires_at__gt=timezone.now()
            ).distinct()
        return queryset

class PromoCodeOrderingFilter(OrderingFilter):
    """Map legacy ordering fields to match actual model names."""

    field_map = {
        'views': 'views_count'
    }

    def get_ordering(self, request, queryset, view):
        ordering = super().get_ordering(request, queryset, view)
        if not ordering:
            return ordering

        mapped = []
        for field in ordering:
            prefix = '-' if field.startswith('-') else ''
            raw_field = field.lstrip('-')
            mapped_field = self.field_map.get(raw_field, raw_field)
            mapped.append(prefix + mapped_field)
        return mapped
