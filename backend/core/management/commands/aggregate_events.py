"""
Management команда для агрегации событий (Events) в дневную статистику (DailyAgg)
Использование: python manage.py aggregate_events [--days N]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta, date
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Агрегирует события (Events) в дневную статистику (DailyAgg)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=2,
            help='Количество дней назад для агрегации (по умолчанию 2)'
        )

    def handle(self, *args, **options):
        from core.models import Event, DailyAgg

        days = options['days']
        cutoff_time = timezone.now() - timedelta(days=days)

        self.stdout.write(f"Агрегация событий с {cutoff_time.strftime('%Y-%m-%d %H:%M')}...")

        events = Event.objects.filter(created_at__gte=cutoff_time)
        total_events = events.count()

        if total_events == 0:
            self.stdout.write(self.style.WARNING('Нет событий для агрегации'))
            return

        self.stdout.write(f"Найдено событий: {total_events}")

        aggregated = 0
        today = date.today()

        # Группируем по типу, промо, магазину, витрине
        groups = events.values(
            'event_type', 'promo_id', 'store_id', 'showcase_id'
        ).annotate(
            total=Count('id'),
            unique=Count('id', filter=Q(is_unique=True))
        )

        for group in groups:
            obj, created = DailyAgg.objects.get_or_create(
                date=today,
                event_type=group['event_type'],
                promo_id=group['promo_id'],
                store_id=group['store_id'],
                showcase_id=group['showcase_id'],
                defaults={
                    'count': group['total'],
                    'unique_count': group['unique']
                }
            )

            if not created:
                obj.count += group['total']
                obj.unique_count += group['unique']
                obj.save()

            aggregated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Агрегировано {aggregated} групп событий в DailyAgg'
            )
        )
