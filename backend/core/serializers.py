from rest_framework import serializers
from django.utils import timezone
from .models import Store, Category, PromoCode, Banner, StaticPage, Partner, ContactMessage


class CategorySerializer(serializers.ModelSerializer):
    promocodes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 
            'is_active', 'created_at', 'promocodes_count'
        ]
        # ИСПРАВЛЕНО: Убираем поля которых может не быть в модели
        extra_kwargs = {}
    
    def get_promocodes_count(self, obj):
        """Подсчитываем количество активных промокодов в категории"""
        return obj.promocode_set.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).count()


class StoreSerializer(serializers.ModelSerializer):
    promocodes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'logo', 'rating', 'site_url',
            'description', 'is_active', 'promocodes_count', 'created_at'
        ]
    
    def get_promocodes_count(self, obj):
        """
        ИСПРАВЛЕНО: Правильный подсчет активных промокодов для популярности
        """
        return obj.promocodes.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).count()


class StoreDetailSerializer(serializers.ModelSerializer):
    promocodes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'logo', 'rating', 'description', 
            'site_url', 'is_active', 'created_at', 'promocodes_count'
        ]
    
    def get_promocodes_count(self, obj):
        return obj.promocodes.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).count()


class PromoCodeSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    
    # ИСПРАВЛЕНО: Computed поля для удобства фронтенда
    has_promocode = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    # ИСПРАВЛЕНО: Безопасные поля с проверкой на существование
    discount_text = serializers.SerializerMethodField()
    valid_until = serializers.SerializerMethodField()
    offer_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PromoCode
        fields = [
            # БАЗОВЫЕ поля которые точно есть в модели
            'id', 'title', 'description', 'code', 'discount_value', 
            'discount_label', 'is_hot', 'is_recommended', 'expires_at', 'views', 
            'affiliate_url', 'store', 'categories', 'is_active',
            'created_at', 'updated_at',
            # COMPUTED поля
            'has_promocode', 'is_expired', 'days_until_expiry',
            'discount_text', 'valid_until', 'offer_type_display'
        ]
        
        # ДОБАВЛЕНО: Безопасная обработка дополнительных полей
        extra_kwargs = {}
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # ИСПРАВЛЕНО: Динамически добавляем поля если они есть в модели
        model_fields = [f.name for f in self.Meta.model._meta.get_fields()]
        
        # Проверяем наличие дополнительных полей
        additional_fields = [
            'offer_type', 'long_description', 'steps', 
            'fine_print', 'disclaimer', 'external_link'
        ]
        
        for field_name in additional_fields:
            if field_name in model_fields and field_name not in self.fields:
                self.fields[field_name] = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def get_has_promocode(self, obj):
        """Определяем, есть ли промокод для копирования"""
        return bool(getattr(obj, 'code', None) and str(getattr(obj, 'code', '')).strip())
    
    def get_is_expired(self, obj):
        """Проверяем, истек ли промокод"""
        expires_at = getattr(obj, 'expires_at', None)
        if not expires_at:
            return False
        return expires_at <= timezone.now()
    
    def get_days_until_expiry(self, obj):
        """Количество дней до истечения"""
        expires_at = getattr(obj, 'expires_at', None)
        if not expires_at:
            return None
        
        delta = expires_at - timezone.now()
        if delta.days < 0:
            return 0
        return delta.days
    
    def get_discount_text(self, obj):
        """Безопасное получение текста скидки"""
        # Пробуем разные варианты названий полей
        discount_label = getattr(obj, 'discount_label', None)
        if discount_label:
            return discount_label
        
        discount_text = getattr(obj, 'discount_text', None)
        if discount_text:
            return discount_text
        
        discount_value = getattr(obj, 'discount_value', None)
        if discount_value:
            return f"{discount_value}%"
        
        return "Скидка"
    
    def get_valid_until(self, obj):
        """Безопасное получение даты истечения"""
        expires_at = getattr(obj, 'expires_at', None)
        valid_until = getattr(obj, 'valid_until', None)
        
        return expires_at or valid_until
    
    def get_offer_type_display(self, obj):
        """Безопасное получение типа оффера"""
        # Проверяем есть ли метод get_offer_type_display
        if hasattr(obj, 'get_offer_type_display'):
            try:
                return obj.get_offer_type_display()
            except:
                pass
        
        # Проверяем есть ли поле offer_type
        offer_type = getattr(obj, 'offer_type', None)
        if offer_type:
            type_mapping = {
                'coupon': 'Промокод',
                'deal': 'Скидка', 
                'financial': 'Финансовая услуга',
                'cashback': 'Кэшбэк'
            }
            return type_mapping.get(offer_type, 'Промокод')
        
        return 'Промокод'


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'subtitle', 'image', 'cta_text', 
            'cta_url', 'is_active', 'sort_order', 'created_at'
        ]


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = [
            'id', 'name', 'logo', 'url', 'order', 
            'is_active', 'created_at'
        ]


class StaticPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaticPage
        fields = ['slug', 'title', 'content', 'is_active', 'updated_at']


class ContactMessageSerializer(serializers.ModelSerializer):
    """Сериализатор для сообщений обратной связи"""
    
    # Поля только для чтения - заполняются автоматически
    created_at = serializers.DateTimeField(read_only=True)
    is_processed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'name', 'email', 'subject', 'message',           # Основные поля для ввода
            'page', 'user_agent', 'ip_address',  # Метаданные (опциональные)
            'created_at', 'is_processed'         # Поля только для чтения
        ]
        
        # Указываем, какие поля обязательны для заполнения
        extra_kwargs = {
            'name': {
                'required': True,
                'max_length': 100,
                'error_messages': {
                    'required': 'Поле "Имя" обязательно для заполнения',
                    'max_length': 'Имя не должно превышать 100 символов'
                }
            },
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Поле "Email" обязательно для заполнения',
                    'invalid': 'Введите корректный email адрес'
                }
            },
            'subject': {
                'required': True,
                'max_length': 200,
                'allow_blank': False,
                'error_messages': {
                    'required': 'Subject is required.',
                    'max_length': 'Subject must be 200 characters or fewer.'
                }
            },
            'message': {
                'required': True,
                'error_messages': {
                    'required': 'Поле "Сообщение" обязательно для заполнения'
                }
            },
            'page': {'required': False},
            'user_agent': {'required': False},
            'ip_address': {'required': False}
        }
    
    def validate_name(self, value):
        """Валидация поля имени"""
        if not value or not value.strip():
            raise serializers.ValidationError("Имя не может быть пустым")
        
        # Убираем лишние пробелы
        value = value.strip()
        
        # Проверяем минимальную длину
        if len(value) < 2:
            raise serializers.ValidationError("Имя должно содержать минимум 2 символа")
        
        return value
    
    def validate_subject(self, value):
        """Validate contact subject."""
        if not value or not value.strip():
            raise serializers.ValidationError("Subject is required.")
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError("Subject must contain at least 5 characters.")
        if len(value) > 200:
            raise serializers.ValidationError("Subject must contain at most 200 characters.")
        return value

    def validate_message(self, value):
        """Валидация поля сообщения"""
        if not value or not value.strip():
            raise serializers.ValidationError("Сообщение не может быть пустым")
        
        # Убираем лишние пробелы
        value = value.strip()
        
        # Проверяем минимальную длину
        if len(value) < 10:
            raise serializers.ValidationError("Сообщение должно содержать минимум 10 символов")
        
        # Проверяем максимальную длину
        if len(value) > 2000:
            raise serializers.ValidationError("Сообщение не должно превышать 2000 символов")
        
        return value
    
    def validate_email(self, value):
        """Дополнительная валидация email"""
        if not value or not value.strip():
            raise serializers.ValidationError("Email не может быть пустым")
        
        value = value.strip().lower()
        
        # Базовая проверка на спам-домены (можно расширить)
        spam_domains = [
            'tempmail.org', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com'
        ]
        
        domain = value.split('@')[-1] if '@' in value else ''
        if domain in spam_domains:
            raise serializers.ValidationError("Использование временных email адресов запрещено")
        
        return value
    
    def create(self, validated_data):
        """Переопределяем создание объекта для добавления метаданных"""
        
        # Получаем request из контекста
        request = self.context.get('request')
        
        if request:
            # Автоматически заполняем метаданные из запроса
            if not validated_data.get('user_agent'):
                validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            
            if not validated_data.get('ip_address'):
                # Получаем IP адрес с учетом прокси
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    validated_data['ip_address'] = x_forwarded_for.split(',')[0].strip()
                else:
                    validated_data['ip_address'] = request.META.get('REMOTE_ADDR')
            
            if not validated_data.get('page'):
                # Пытаемся получить реферер
                validated_data['page'] = request.META.get('HTTP_REFERER', '')
        
        # Создаем объект
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Кастомизируем вывод данных"""
        data = super().to_representation(instance)
        
        # Добавляем статус для фронтенда
        data['status'] = 'success'
        data['message_status'] = 'sent'
        
        # Убираем чувствительные данные из ответа
        data.pop('user_agent', None)
        data.pop('ip_address', None)
        
        return data