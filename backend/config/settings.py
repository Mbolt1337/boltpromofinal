from pathlib import Path
import os
from dotenv import load_dotenv

# Загрузка переменных из .env файла
load_dotenv()


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in ('true', '1', 'yes')

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError('SECRET_KEY environment variable is required')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = _env_bool('DEBUG', default=False)

# ИСПРАВЛЕНО: Добавлены домены для продакшена
ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', 'localhost').split(',') if host.strip()]

# Доверенные источники для CSRF (для продакшена)
CSRF_TRUSTED_ORIGINS = [
    'https://boltpromo.ru',
    'https://www.boltpromo.ru',
]

# Application definition
INSTALLED_APPS = [
    # ✅ НОВОЕ: Jazzmin должен быть ПЕРВЫМ перед django.contrib.admin
    'jazzmin',
    
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    
    # ✅ НОВОЕ: Импорт/экспорт для админки
    'import_export',
    
    # Local apps
    'core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # НОВОЕ: Canonical redirect (должен быть раньше остальных, после security)
    'core.middleware.CanonicalHostMiddleware',
    # НОВОЕ: Maintenance mode middleware (проверяется до всех остальных)
    'core.middleware.MaintenanceModeMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # ✅ ДОБАВЛЕНО: Кэш middleware для оптимизации
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
if DEBUG:
    # SQLite для разработки
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # PostgreSQL для продакшена
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'boltpromo'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'sslmode': 'prefer',
            },
        }
    }

# ✅ ДОБАВЛЕНО: Настройки кэширования
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,  # 5 минут по умолчанию
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
            'CULL_FREQUENCY': 4,
        }
    },
    # ✅ ДОБАВЛЕНО: Отдельный кэш для долгоживущих данных
    'long_term': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'long-term-cache',
        'TIMEOUT': 1800,  # 30 минут для статичных данных
        'OPTIONS': {
            'MAX_ENTRIES': 500,
            'CULL_FREQUENCY': 3,
        }
    },
    # ✅ ДОБАВЛЕНО: Кэш для статистики
    'stats': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'stats-cache',
        'TIMEOUT': 600,  # 10 минут для статистики
        'OPTIONS': {
            'MAX_ENTRIES': 100,
            'CULL_FREQUENCY': 2,
        }
    }
}

# ✅ ДОБАВЛЕНО: Настройки кэширования сессий и middleware
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300  # 5 минут для страниц
CACHE_MIDDLEWARE_KEY_PREFIX = 'boltpromo'

# ✅ ДОБАВЛЕНО: Настройки кэширования сессий
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_CACHE_ALIAS = 'default'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ИСПРАВЛЕНО: Django REST Framework с улучшенными настройками
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    # ✅ ИСПРАВЛЕНО: Унифицированная пагинация
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,  # ✅ Единый размер страницы для всего проекта
    
    # ✅ ИСПРАВЛЕНО: Правильный порядок фильтров
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    
    # ✅ ИСПРАВЛЕНО: Throttling отключен для разработки
    # ВАЖНО: Включите эти настройки перед деплоем в продакшен!
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ] if not DEBUG else [],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    },
    
    # ✅ НОВОЕ: Настройки для лучшей безопасности
    'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.NamespaceVersioning',
    'DEFAULT_VERSION': 'v1',
    'ALLOWED_VERSIONS': ['v1'],
    'VERSION_PARAM': 'version',
}

# CORS settings - ИСПРАВЛЕНО: Добавлены домены для продакшена
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        "https://boltpromo.ru",
        "https://www.boltpromo.ru",
    ]

CORS_ALLOW_CREDENTIALS = True

# Spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'BoltPromo API',
    'DESCRIPTION': 'API для платформы промокодов и скидок',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# ✅ НОВОЕ: Настройки Jazzmin для красивой админки
JAZZMIN_SETTINGS = {
    # Основная информация
    "site_title": "BoltPromo Admin",
    "site_header": "BoltPromo",
    "site_brand": "BoltPromo",
    "site_logo": None,  # Путь к логотипу (добавим позже)
    "site_logo_classes": "img-circle",
    "site_icon": None,  # Иконка сайта для вкладки браузера
    
    # Приветствие
    "welcome_sign": "Добро пожаловать в админку BoltPromo",
    "copyright": "BoltPromo © 2025",
    
    # Поиск по моделям
    "search_model": ["auth.User", "core.PromoCode", "core.Store", "core.Category"],
    
    # Пользователь в топ-меню
    "user_avatar": None,
    
    ############
    # Топ меню #
    ############
    "topmenu_links": [
        # Внешние ссылки
        {"name": "Главная сайта", "url": "/", "new_window": True},
        {"name": "API Docs", "url": "/api/docs/", "new_window": True},
        
        # Модели
        {"model": "core.PromoCode"},
        {"model": "core.Store"},
        
        # Приложения
        {"app": "core"},
    ],

    #############
    # Боковое меню #
    #############
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    
    # Порядок приложений и моделей
    "order_with_respect_to": ["core", "auth"],
    
    # Кастомные ссылки для приложения core
    "custom_links": {
        "core": [
            {
                "name": "📊 Статистика",
                "url": "admin_stats_dashboard",
                "icon": "fas fa-chart-line",
                "permissions": ["core.view_event"]
            },
            {
                "name": "⚙️ Настройки сайта",
                "url": "/admin/core/sitesettings/1/change/",
                "icon": "fas fa-cog",
                "permissions": ["core.change_sitesettings"]
            }
        ]
    },

    # Иконки для приложений/моделей
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        
        "core.Category": "fas fa-tags",
        "core.Store": "fas fa-store",
        "core.PromoCode": "fas fa-ticket-alt",
        "core.Banner": "fas fa-image",
        "core.Partner": "fas fa-handshake",
        "core.StaticPage": "fas fa-file-alt",
        "core.ContactMessage": "fas fa-envelope",
    },
    
    # Цвета интерфейса
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    #################
    # UI Настройки #
    #################
    
    # Показать ли UI Customizer (панель настройки темы)
    "show_ui_builder": False,
    
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible", 
        "auth.group": "vertical_tabs",
        "core.promocode": "horizontal_tabs",
        "core.store": "collapsible",
    },
}

# Настройки UI темы Jazzmin (улучшенная читаемость)
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": True,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_flat_style": False,
    
    # Улучшенная читаемость - светлая тема с хорошим контрастом
    "theme": "lumen",  # Светлая тема с хорошим контрастом
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",        # Синие кнопки
        "secondary": "btn-secondary",    # Серые кнопки 
        "info": "btn-info",             # Голубые кнопки
        "warning": "btn-warning",       # Жёлтые кнопки
        "danger": "btn-danger",         # Красные кнопки
        "success": "btn-success"        # Зелёные кнопки
    },
}

# ✅ НОВОЕ: Email настройки из .env файла
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.yandex.ru')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'support@boltpromo.ru')

# ✅ НОВОЕ: Настройки безопасности для продакшена
if not DEBUG:
    # SSL/HTTPS настройки
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # Настройки cookies
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    
    # Настройки безопасности браузера
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
    
    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 год
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # X-Frame-Options
    X_FRAME_OPTIONS = 'DENY'
    
    # ✅ ДОБАВЛЕНО: Content Security Policy
    SECURE_CONTENT_SECURITY_POLICY = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'"
    )
    
    # ✅ ДОБАВЛЕНО: Дополнительные заголовки безопасности
    SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
    
    # ✅ ДОБАВЛЕНО: Permissions Policy
    SECURE_PERMISSIONS_POLICY = {
        "accelerometer": [],
        "camera": [],
        "geolocation": [],
        "gyroscope": [],
        "magnetometer": [],
        "microphone": [],
        "payment": [],
        "usb": [],
    }

# ✅ ИСПРАВЛЕНО: Упрощенное логирование
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.cache': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        },
    },
}