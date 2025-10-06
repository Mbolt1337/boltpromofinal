"""
Redis caching utilities for API responses.

Provides helpers for caching DRF responses with proper key generation,
TTL management, and cache invalidation support.
"""

from django.core.cache import cache
from django.conf import settings
import hashlib
import json
from typing import Any, Optional, Dict
import logging

logger = logging.getLogger(__name__)


def generate_cache_key(prefix: str, **kwargs) -> str:
    """
    Generate a versioned cache key from prefix and parameters.

    Args:
        prefix: Cache key prefix (e.g., 'promocodes_list')
        **kwargs: Key-value pairs to include in cache key

    Returns:
        String cache key with CACHE_VERSION

    Example:
        >>> generate_cache_key('promocodes', page=1, ordering='popular')
        'v1:promocodes:page=1:ordering=popular:hash=abc123'
    """
    cache_version = getattr(settings, 'CACHE_VERSION', '1')

    # Сортируем параметры для стабильного ключа
    sorted_params = sorted(kwargs.items())
    params_str = ':'.join(f"{k}={v}" for k, v in sorted_params if v is not None)

    # Хэш для длинных параметров
    if len(params_str) > 100:
        params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
        params_str = f"hash={params_hash}"

    key = f"v{cache_version}:{prefix}:{params_str}" if params_str else f"v{cache_version}:{prefix}"

    return key


def get_cached_api_response(
    cache_key: str,
    default: Any = None
) -> Optional[Dict]:
    """
    Get cached API response data.

    Args:
        cache_key: Cache key to retrieve
        default: Default value if cache miss

    Returns:
        Cached data dict or default value
    """
    try:
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            logger.debug(f"Cache HIT: {cache_key}")
            return cached_data
        logger.debug(f"Cache MISS: {cache_key}")
        return default
    except Exception as e:
        logger.warning(f"Cache GET error for key {cache_key}: {e}")
        return default


def set_cached_api_response(
    cache_key: str,
    data: Dict,
    ttl: int = 900  # 15 minutes default
) -> bool:
    """
    Set API response data in cache.

    Args:
        cache_key: Cache key to set
        data: Response data dict to cache
        ttl: Time-to-live in seconds (default: 15 min)

    Returns:
        True if successful, False otherwise
    """
    try:
        cache.set(cache_key, data, timeout=ttl)
        logger.debug(f"Cache SET: {cache_key} (TTL: {ttl}s)")
        return True
    except Exception as e:
        logger.warning(f"Cache SET error for key {cache_key}: {e}")
        return False


def invalidate_cache_pattern(pattern_prefix: str) -> int:
    """
    Invalidate all cache keys matching a pattern prefix.

    Note: This requires cache backend that supports pattern deletion.
    For Redis, use delete_pattern. For LocMem, iterates and deletes.

    Args:
        pattern_prefix: Prefix to match (e.g., 'v1:promocodes')

    Returns:
        Number of keys deleted
    """
    try:
        # Для Redis можно использовать delete_pattern
        if hasattr(cache, 'delete_pattern'):
            deleted = cache.delete_pattern(f"{pattern_prefix}*")
            logger.info(f"Invalidated {deleted} cache keys matching '{pattern_prefix}*'")
            return deleted
        else:
            # Для других backends (LocMem) - просто логируем
            logger.warning(f"Cache backend does not support pattern deletion. Use CACHE_VERSION bump instead.")
            return 0
    except Exception as e:
        logger.error(f"Cache invalidation error for pattern '{pattern_prefix}': {e}")
        return 0


def cache_api_response(ttl: int = 900):
    """
    Decorator for caching DRF list view responses.

    Usage:
        @cache_api_response(ttl=1800)  # 30 minutes
        def list(self, request, *args, **kwargs):
            return super().list(request, *args, **kwargs)

    Args:
        ttl: Time-to-live in seconds
    """
    def decorator(func):
        def wrapper(self, request, *args, **kwargs):
            # Generate cache key from request params
            view_name = self.__class__.__name__.lower()
            cache_key = generate_cache_key(
                view_name,
                query=request.GET.urlencode(),
                path=request.path
            )

            # Try to get from cache
            cached_response = get_cached_api_response(cache_key)
            if cached_response is not None:
                from rest_framework.response import Response
                return Response(cached_response)

            # Execute view and cache result
            response = func(self, request, *args, **kwargs)

            # Only cache successful responses
            if response.status_code == 200:
                set_cached_api_response(cache_key, response.data, ttl=ttl)

            return response

        return wrapper
    return decorator
