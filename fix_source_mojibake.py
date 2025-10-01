#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для исправления кракозябр в исходных файлах Python
"""
import os
import re
from pathlib import Path


def looks_broken(text):
    """Проверяет, выглядит ли текст как mojibake"""
    mojibake_patterns = [
        r'Р[ЎС]',
        r'С[Р]',
        r'РЋ',
        r'Р†',
        r'в€',
        r'вЂ',
    ]
    return any(re.search(pattern, text) for pattern in mojibake_patterns)


def try_fix_str(s):
    """Пытается исправить mojibake строку через latin1 -> utf-8"""
    try:
        # Пробуем декодировать как latin1 и закодировать обратно в utf-8
        return s.encode('latin1', errors='ignore').decode('utf-8', errors='ignore')
    except (UnicodeDecodeError, UnicodeEncodeError):
        return s


def fix_file(file_path):
    """Исправляет mojibake в одном файле"""
    print(f"\n[*] Проверка: {file_path}")

    try:
        # Читаем файл как есть
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        if not looks_broken(content):
            print("   [OK] Кодировка в порядке")
            return False

        print("   [!] Найдены кракозябры, пытаемся исправить...")

        # Пытаемся прочитать как latin1 и сохранить как utf-8
        with open(file_path, 'r', encoding='latin1') as f:
            content_latin1 = f.read()

        # Записываем обратно как UTF-8
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content_latin1)

        print("   [OK] Файл исправлен и пересохранён в UTF-8")
        return True

    except Exception as e:
        print(f"   [ERROR] Ошибка: {e}")
        return False


def main():
    """Главная функция"""
    print("=" * 80)
    print("Починка кракозябр в исходных файлах Python")
    print("=" * 80)

    # Файлы для проверки
    backend_root = Path(__file__).parent / 'backend'

    files_to_check = [
        backend_root / 'config' / 'urls.py',
        backend_root / 'core' / 'admin.py',
        backend_root / 'core' / 'models.py',
        backend_root / 'core' / 'views.py',
    ]

    # Также ищем все admin.py и models.py
    for pattern in ['**/admin.py', '**/models.py']:
        files_to_check.extend(backend_root.glob(pattern))

    # Убираем дубликаты
    files_to_check = list(set(f for f in files_to_check if f.exists()))

    fixed_count = 0
    for file_path in sorted(files_to_check):
        if fix_file(file_path):
            fixed_count += 1

    print("\n" + "=" * 80)
    print(f"Готово! Исправлено файлов: {fixed_count} из {len(files_to_check)}")
    print("=" * 80)


if __name__ == '__main__':
    main()
