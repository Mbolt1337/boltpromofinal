# -*- coding: utf-8 -*-
"""
Скрипт для исправления двойного кодирования UTF-8
"""
import os
from pathlib import Path


def fix_double_utf8(text):
    """
    Исправляет двойное кодирование UTF-8:
    текст был закодирован в UTF-8, затем эти байты интерпретированы как latin1,
    и снова закодированы в UTF-8
    """
    try:
        # Шаг 1: Декодируем UTF-8 в байты
        utf8_bytes = text.encode('utf-8')

        # Шаг 2: Интерпретируем эти байты как latin1 (обратная операция)
        latin1_str = utf8_bytes.decode('latin1')

        # Шаг 3: Декодируем обратно из UTF-8
        fixed_text = latin1_str.encode('latin1').decode('utf-8')

        return fixed_text
    except:
        return text


def fix_file(file_path):
    """Исправляет двойное кодирование в файле"""
    print(f"[*] Обработка: {file_path}")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Проверяем, есть ли проблемные символы
        if 'Ð' not in content and 'Â' not in content and '€' not in content:
            print("    [OK] Файл чист")
            return False

        print("    [!] Найдено двойное кодирование, исправляю...")

        # Исправляем
        fixed_content = fix_double_utf8(content)

        # Сохраняем
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)

        print("    [OK] Исправлено!")
        return True

    except Exception as e:
        print(f"    [ERROR] {e}")
        return False


def main():
    print("=" * 80)
    print("Исправление двойного кодирования UTF-8 в Python файлах")
    print("=" * 80)

    backend_root = Path(__file__).parent / 'backend'

    files_to_fix = [
        backend_root / 'config' / 'urls.py',
        backend_root / 'core' / 'admin.py',
        backend_root / 'core' / 'models.py',
        backend_root / 'core' / 'views.py',
    ]

    fixed_count = 0
    for file_path in files_to_fix:
        if file_path.exists() and fix_file(file_path):
            fixed_count += 1

    print("\n" + "=" * 80)
    print(f"Готово! Исправлено файлов: {fixed_count}")
    print("=" * 80)


if __name__ == '__main__':
    main()
