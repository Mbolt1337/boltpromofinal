"""
Django Sitemaps для BoltPromo
Генерация sitemap.xml для всех типов страниц
"""
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Category, Store, PromoCode, Showcase, StaticPage
from django.utils import timezone


class StaticViewSitemap(Sitemap):
    """Статические страницы (главная, контакты, FAQ и т.д.)"""
    priority = 1.0
    changefreq = 'daily'

    def items(self):
        return ['home', 'categories-list', 'stores-list', 'hot', 'showcases-list']

    def location(self, item):
        if item == 'home':
            return '/'
        elif item == 'categories-list':
            return '/categories'
        elif item == 'stores-list':
            return '/stores'
        elif item == 'hot':
            return '/hot'
        elif item == 'showcases-list':
            return '/showcases'
        return '/'


class CategorySitemap(Sitemap):
    """Страницы категорий"""
    changefreq = 'daily'
    priority = 0.9

    def items(self):
        return Category.objects.filter(is_active=True).order_by('name')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/categories/{obj.slug}'


class StoreSitemap(Sitemap):
    """Страницы магазинов"""
    changefreq = 'daily'
    priority = 0.8

    def items(self):
        return Store.objects.filter(is_active=True).order_by('name')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/stores/{obj.slug}'


class PromoCodeSitemap(Sitemap):
    """Страницы промокодов (детальные страницы)"""
    changefreq = 'hourly'
    priority = 0.7

    def items(self):
        # Только активные промокоды, которые еще не истекли
        return PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).select_related('store').order_by('-created_at')[:1000]  # Ограничение 1000 для производительности

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/promo/{obj.id}'


class ShowcaseSitemap(Sitemap):
    """Страницы витрин (подборок)"""
    changefreq = 'daily'
    priority = 0.8

    def items(self):
        return Showcase.objects.filter(is_active=True).order_by('sort_order', '-created_at')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/showcases/{obj.slug}'


class StaticPageSitemap(Sitemap):
    """Кастомные статические страницы (О нас, FAQ и т.д.)"""
    changefreq = 'weekly'
    priority = 0.6

    def items(self):
        return StaticPage.objects.filter(is_active=True).order_by('title')

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/pages/{obj.slug}'
