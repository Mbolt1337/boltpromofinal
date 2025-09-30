"""
Management команда для исправления битой кириллицы (mojibake) в БД.

Проблема: часть строк сохранена в БД с битой кодировкой (UTF-8 байты прочитаны как latin-1).
Решение: безопасно конвертировать строки через .encode('latin1').decode('utf-8').

Использование:
    python manage.py fix_encoding --dry-run  # Просмотр изменений без сохранения
    python manage.py fix_encoding --apply     # Применение изменений
"""

from django.core.management.base import BaseCommand
from django.db import transaction
import re


class Command(BaseCommand):
    help = 'Исправление битой кириллицы (mojibake) в текстовых полях моделей'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Применить изменения (по умолчанию только просмотр)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Только просмотр изменений без сохранения'
        )

    def handle(self, *args, **options):
        # Импорты моделей
        from core.models import Banner, PromoCode, StaticPage

        apply_changes = options.get('apply', False)
        dry_run = options.get('dry_run', False) or not apply_changes

        # Предупреждение
        self.stdout.write(self.style.WARNING('\n' + '='*80))
        self.stdout.write(self.style.WARNING('ВНИМАНИЕ: Инструмент для исправления битой кириллицы'))
        self.stdout.write(self.style.WARNING('='*80))
        self.stdout.write('\nРЕКОМЕНДАЦИЯ: Создайте бэкап БД перед применением изменений!')
        self.stdout.write('Команда для бэкапа PostgreSQL:')
        self.stdout.write('  pg_dump -U postgres -d boltpromo > backup_$(date +%Y%m%d_%H%M%S).sql\n')

        if dry_run:
            self.stdout.write(self.style.SUCCESS('Режим: ПРОСМОТР (--dry-run)\n'))
        else:
            self.stdout.write(self.style.ERROR('Режим: ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ (--apply)\n'))
            confirm = input('Продолжить? (yes/no): ')
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.WARNING('Отменено пользователем'))
                return

        # Конфигурация моделей и полей для проверки
        models_config = [
            {
                'model': Banner,
                'name': 'Banner',
                'fields': ['title', 'subtitle', 'cta_text']
            },
            {
                'model': PromoCode,
                'name': 'PromoCode',
                'fields': ['title', 'description', 'discount_label', 'long_description', 'steps', 'fine_print', 'disclaimer']
            },
            {
                'model': StaticPage,
                'name': 'StaticPage',
                'fields': ['title', 'content']
            }
        ]

        total_checked = 0
        total_fixed = 0
        changes_log = []

        # Обработка каждой модели
        for config in models_config:
            model = config['model']
            model_name = config['name']
            fields = config['fields']

            self.stdout.write(f'\n{"-"*80}')
            self.stdout.write(f'Проверка модели: {model_name}')
            self.stdout.write(f'{"-"*80}')

            for instance in model.objects.all():
                for field_name in fields:
                    # Пропускаем поля, которые не существуют у модели
                    if not hasattr(instance, field_name):
                        continue

                    original_value = getattr(instance, field_name, None)

                    # Пропускаем пустые значения
                    if not original_value or not isinstance(original_value, str):
                        continue

                    total_checked += 1

                    # Проверяем, выглядит ли строка битой
                    if self._looks_broken(original_value):
                        fixed_value = self._maybe_fix(original_value)

                        # Если удалось исправить
                        if fixed_value != original_value and self._looks_russian(fixed_value):
                            total_fixed += 1

                            change_info = {
                                'model': model_name,
                                'id': instance.id,
                                'field': field_name,
                                'original': original_value[:100],
                                'fixed': fixed_value[:100]
                            }
                            changes_log.append(change_info)

                            # Вывод изменения
                            self.stdout.write(
                                self.style.WARNING(f'\n[{model_name}] ID={instance.id}, поле={field_name}')
                            )
                            self.stdout.write(f'  До:    {original_value[:100]}...')
                            self.stdout.write(self.style.SUCCESS(f'  После: {fixed_value[:100]}...'))

                            # Применение изменений
                            if not dry_run:
                                try:
                                    with transaction.atomic():
                                        setattr(instance, field_name, fixed_value)
                                        instance.save(update_fields=[field_name])
                                        self.stdout.write(self.style.SUCCESS('  ✓ Сохранено'))
                                except Exception as e:
                                    self.stdout.write(self.style.ERROR(f'  ✗ Ошибка: {str(e)}'))

        # Итоговая статистика
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS('ИТОГИ'))
        self.stdout.write('='*80)
        self.stdout.write(f'Проверено полей: {total_checked}')
        self.stdout.write(f'Найдено битых строк: {total_fixed}')

        if dry_run and total_fixed > 0:
            self.stdout.write('\n' + self.style.WARNING('Для применения изменений запустите:'))
            self.stdout.write(self.style.WARNING('  python manage.py fix_encoding --apply'))
        elif not dry_run and total_fixed > 0:
            self.stdout.write('\n' + self.style.SUCCESS('✓ Все изменения применены!'))

        self.stdout.write('\n')

    def _looks_broken(self, text: str) -> bool:
        """Проверяет, выглядит ли строка битой (mojibake)."""
        # Характерные паттерны битой кириллицы (mojibake от UTF-8 в latin-1)
        # Используем raw strings и явные unicode escapes для безопасности
        broken_patterns = [
            '\xd0', '\xd1',  # Типичные байты UTF-8 кириллицы
            'Р', 'С',  # Частые артефакты
            'РЎ', 'Рё', 'РѕРє', 'Рј',  # Битые слова
            'Р°', 'РџСЂРѕ', 'РЎРєРё',  # Ещё битые паттерны
        ]

        # Если есть хотя бы один характерный паттерн
        for pattern in broken_patterns:
            if pattern in text:
                # И при этом нет нормальной кириллицы
                if not re.search(r'[а-яА-ЯёЁ]{3,}', text):
                    return True
        return False

    def _looks_russian(self, text: str) -> bool:
        """Проверяет, содержит ли строка нормальную кириллицу."""
        # Должно быть хотя бы несколько кириллических слов подряд
        return bool(re.search(r'[а-яА-ЯёЁ]{3,}', text))

    def _maybe_fix(self, text: str) -> str:
        """Пытается исправить битую кириллицу."""
        try:
            # Основной метод: encode latin-1 → decode utf-8
            fixed = text.encode('latin1').decode('utf-8')

            # Если после исправления есть читаемая кириллица и пропали артефакты
            if self._looks_russian(fixed) and not self._looks_broken(fixed):
                return fixed
        except (UnicodeDecodeError, UnicodeEncodeError):
            pass

        # Если не удалось исправить, возвращаем оригинал
        return text
