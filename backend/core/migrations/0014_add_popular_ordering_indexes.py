# Generated manually for popular ordering optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_add_performance_indexes'),
    ]

    operations = [
        # Составной индекс для быстрого вычисления has_badge (is_hot OR is_recommended)
        migrations.AddIndex(
            model_name='promocode',
            index=models.Index(fields=['is_hot', 'is_recommended', '-created_at'], name='core_promoc_hot_rec_created_idx'),
        ),
        # Индекс для DailyAgg для быстрой агрегации usage_7d
        migrations.AddIndex(
            model_name='dailyagg',
            index=models.Index(fields=['promo', 'date', 'event_type'], name='core_dailya_promo_date_type_idx'),
        ),
        # Индекс для быстрой фильтрации активных и неистекших промокодов
        migrations.AddIndex(
            model_name='promocode',
            index=models.Index(fields=['is_active', 'expires_at', '-created_at'], name='core_promoc_active_exp_created_idx'),
        ),
    ]
