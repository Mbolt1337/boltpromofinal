"""
Management команда для обновления автогорячих промокодов
Использование: python manage.py update_auto_hot
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Sum, Q
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Обновляет флаг is_hot для промокодов (expires < 72h + clicks growth)'

    def handle(self, *args, **options):
        from core.models import PromoCode, DailyAgg

        now = timezone.now()
        hot_threshold = now + timedelta(hours=72)
        week_ago = (now - timedelta(days=7)).date()

        self.stdout.write(f"Обновление автогорячих промокодов...")
        self.stdout.write(f"Порог: промокоды истекают до {hot_threshold.strftime('%Y-%m-%d %H:%M')}")

        # Сбрасываем is_hot у всех, кто больше не соответствует критериям
        reset_count = PromoCode.objects.filter(is_hot=True).filter(
            Q(is_active=False) | Q(expires_at__lte=now) | Q(expires_at__gt=hot_threshold)
        ).update(is_hot=False)

        self.stdout.write(f"Сброшено флагов is_hot: {reset_count}")

        # Находим кандидатов на is_hot
        candidates = PromoCode.objects.filter(
            is_active=True,
            expires_at__gt=now,
            expires_at__lte=hot_threshold
        )

        self.stdout.write(f"Кандидатов на is_hot: {candidates.count()}")

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
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ {promo.title[:50]} (clicks_7d={clicks_7d})"
                        )
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Обновлено автогорячих: {updated_count} промокодов'
            )
        )
