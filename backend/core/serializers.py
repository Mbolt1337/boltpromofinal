from rest_framework import serializers
from django.utils import timezone
from .models import Store, Category, PromoCode, Banner, StaticPage, Partner, ContactMessage, Showcase, ShowcaseItem


class CategorySerializer(serializers.ModelSerializer):
    promocodes_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'is_active', 'created_at', 'promocodes_count'
        ]
        extra_kwargs = {}


class StoreSerializer(serializers.ModelSerializer):
    promocodes_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'logo', 'rating', 'site_url',
            'description', 'is_active', 'promocodes_count', 'created_at'
        ]


class StoreDetailSerializer(serializers.ModelSerializer):
    promocodes_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'logo', 'rating', 'description',
            'site_url', 'is_active', 'created_at', 'promocodes_count'
        ]


class PromoCodeSerializer(serializers.ModelSerializer):
    store = StoreSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    
    has_promocode = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    discount_text = serializers.SerializerMethodField()
    valid_until = serializers.SerializerMethodField()
    offer_type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = PromoCode
        fields = [
            'id', 'title', 'description', 'code', 'discount_value', 
            'discount_label', 'is_hot', 'is_recommended', 'expires_at', 'views', 
            'affiliate_url', 'store', 'categories', 'is_active',
            'created_at', 'updated_at',
            # COMPUTED Р С—Р С•Р В»РЎРЏ
            'has_promocode', 'is_expired', 'days_until_expiry',
            'discount_text', 'valid_until', 'offer_type_display'
        ]
        
        extra_kwargs = {}
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        model_fields = [f.name for f in self.Meta.model._meta.get_fields()]
        
        additional_fields = [
            'offer_type', 'long_description', 'steps', 
            'fine_print', 'disclaimer', 'external_link'
        ]
        
        for field_name in additional_fields:
            if field_name in model_fields and field_name not in self.fields:
                self.fields[field_name] = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def get_has_promocode(self, obj):
        return bool(getattr(obj, 'code', None) and str(getattr(obj, 'code', '')).strip())
    
    def get_is_expired(self, obj):
        expires_at = getattr(obj, 'expires_at', None)
        if not expires_at:
            return False
        return expires_at <= timezone.now()
    
    def get_days_until_expiry(self, obj):
        expires_at = getattr(obj, 'expires_at', None)
        if not expires_at:
            return None
        
        delta = expires_at - timezone.now()
        if delta.days < 0:
            return 0
        return delta.days
    
    def get_discount_text(self, obj):
        discount_label = getattr(obj, 'discount_label', None)
        if discount_label:
            return discount_label
        
        discount_text = getattr(obj, 'discount_text', None)
        if discount_text:
            return discount_text
        
        discount_value = getattr(obj, 'discount_value', None)
        if discount_value:
            return f"{discount_value}%"
        
        return "Р РЋР С”Р С‘Р Т‘Р С”Р В°"
    
    def get_valid_until(self, obj):
        expires_at = getattr(obj, 'expires_at', None)
        valid_until = getattr(obj, 'valid_until', None)
        
        return expires_at or valid_until
    
    def get_offer_type_display(self, obj):
        if hasattr(obj, 'get_offer_type_display'):
            try:
                return obj.get_offer_type_display()
            except:
                pass
        
        offer_type = getattr(obj, 'offer_type', None)
        if offer_type:
            type_mapping = {
                'coupon': 'Промокод',
                'deal': 'Скидка',
                'financial': 'Финансовая услуга',
                'cashback': 'Р С™РЎРЊРЎв‚¬Р В±РЎРЊР С”'
            }
            return type_mapping.get(offer_type, 'Р СџРЎР‚Р С•Р СР С•Р С”Р С•Р Т‘')
        
        return 'Р СџРЎР‚Р С•Р СР С•Р С”Р С•Р Т‘'


class BannerSerializer(serializers.ModelSerializer):
    link = serializers.URLField(source='cta_url', read_only=True)

    class Meta:
        model = Banner
        fields = [
            'id', 'title', 'subtitle', 'image', 'cta_text',
            'cta_url', 'link', 'is_active', 'sort_order', 'created_at'
        ]
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True},
            'subtitle': {'required': False, 'allow_blank': True},
            'cta_text': {'required': False, 'allow_blank': True},
        }


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
    
    created_at = serializers.DateTimeField(read_only=True)
    is_processed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ContactMessage
        fields = [
            'name', 'email', 'subject', 'message',           # Р С›РЎРѓР Р…Р С•Р Р†Р Р…РЎвЂ№Р Вµ Р С—Р С•Р В»РЎРЏ Р Т‘Р В»РЎРЏ Р Р†Р Р†Р С•Р Т‘Р В°
            'page', 'user_agent', 'ip_address',  # Р СљР ВµРЎвЂљР В°Р Т‘Р В°Р Р…Р Р…РЎвЂ№Р Вµ (Р С•Р С—РЎвЂ Р С‘Р С•Р Р…Р В°Р В»РЎРЉР Р…РЎвЂ№Р Вµ)
            'created_at', 'is_processed'         # Р СџР С•Р В»РЎРЏ РЎвЂљР С•Р В»РЎРЉР С”Р С• Р Т‘Р В»РЎРЏ РЎвЂЎРЎвЂљР ВµР Р…Р С‘РЎРЏ
        ]
        
        extra_kwargs = {
            'name': {
                'required': True,
                'max_length': 100,
                'error_messages': {
                    'required': 'Р СџР С•Р В»Р Вµ "Р ВР СРЎРЏ" Р С•Р В±РЎРЏР В·Р В°РЎвЂљР ВµР В»РЎРЉР Р…Р С• Р Т‘Р В»РЎРЏ Р В·Р В°Р С—Р С•Р В»Р Р…Р ВµР Р…Р С‘РЎРЏ',
                    'max_length': 'Р ВР СРЎРЏ Р Р…Р Вµ Р Т‘Р С•Р В»Р В¶Р Р…Р С• Р С—РЎР‚Р ВµР Р†РЎвЂ№РЎв‚¬Р В°РЎвЂљРЎРЉ 100 РЎРѓР С‘Р СР Р†Р С•Р В»Р С•Р Р†'
                }
            },
            'email': {
                'required': True,
                'error_messages': {
                    'required': 'Р СџР С•Р В»Р Вµ "Email" Р С•Р В±РЎРЏР В·Р В°РЎвЂљР ВµР В»РЎРЉР Р…Р С• Р Т‘Р В»РЎРЏ Р В·Р В°Р С—Р С•Р В»Р Р…Р ВµР Р…Р С‘РЎРЏ',
                    'invalid': 'Р вЂ™Р Р†Р ВµР Т‘Р С‘РЎвЂљР Вµ Р С”Р С•РЎР‚РЎР‚Р ВµР С”РЎвЂљР Р…РЎвЂ№Р в„– email Р В°Р Т‘РЎР‚Р ВµРЎРѓ'
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
                    'required': 'Р СџР С•Р В»Р Вµ "Р РЋР С•Р С•Р В±РЎвЂ°Р ВµР Р…Р С‘Р Вµ" Р С•Р В±РЎРЏР В·Р В°РЎвЂљР ВµР В»РЎРЉР Р…Р С• Р Т‘Р В»РЎРЏ Р В·Р В°Р С—Р С•Р В»Р Р…Р ВµР Р…Р С‘РЎРЏ'
                }
            },
            'page': {'required': False},
            'user_agent': {'required': False},
            'ip_address': {'required': False}
        }
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Invalid input")
        
        value = value.strip()
        
        if len(value) < 2:
            raise serializers.ValidationError("Invalid input")
        
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
        if not value or not value.strip():
            raise serializers.ValidationError("Invalid input")
        
        value = value.strip()
        
        if len(value) < 10:
            raise serializers.ValidationError("Invalid input")
        
        if len(value) > 2000:
            raise serializers.ValidationError("Invalid input")
        
        return value
    
    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Invalid input")
        
        value = value.strip().lower()
        
        spam_domains = [
            'tempmail.org', '10minutemail.com', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com'
        ]
        
        domain = value.split('@')[-1] if '@' in value else ''
        if domain in spam_domains:
            raise serializers.ValidationError("Invalid input")
        
        return value
    
    def create(self, validated_data):
        
        request = self.context.get('request')
        
        if request:
            if not validated_data.get('user_agent'):
                validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            
            if not validated_data.get('ip_address'):
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    validated_data['ip_address'] = x_forwarded_for.split(',')[0].strip()
                else:
                    validated_data['ip_address'] = request.META.get('REMOTE_ADDR')
            
            if not validated_data.get('page'):
                validated_data['page'] = request.META.get('HTTP_REFERER', '')
        
        return super().create(validated_data)
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        data['status'] = 'success'
        data['message_status'] = 'sent'
        
        data.pop('user_agent', None)
        data.pop('ip_address', None)

        return data


class ShowcaseListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка витрин"""
    promos_count = serializers.SerializerMethodField()

    class Meta:
        model = Showcase
        fields = ['id', 'slug', 'title', 'description', 'banner', 'promos_count']

    def get_promos_count(self, obj):
        """Возвращает количество промокодов, даже если аннотация отсутствует"""
        return getattr(obj, 'promos_count', obj.items.count() if hasattr(obj, 'items') else 0)


class ShowcaseDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детальной информации о витрине"""
    promos_count = serializers.SerializerMethodField()

    class Meta:
        model = Showcase
        fields = ['id', 'slug', 'title', 'description', 'banner', 'promos_count', 'is_active', 'created_at', 'updated_at']

    def get_promos_count(self, obj):
        """Возвращает количество промокодов, даже если аннотация отсутствует"""
        return getattr(obj, 'promos_count', obj.items.count() if hasattr(obj, 'items') else 0)