"""
Утилиты для работы с кодировками и исправления mojibake
"""

# Характерные символы битой кириллицы (latin1 вместо utf-8)
MOJIBAKE_HINTS = (
    "Ð", "Ñ", "Ò", "Ó", "Ê", "Ë", "Â", "Ä", "ž", "œ", "", "Р", "С",
    "Рє", "Рѕ", "Р°", "Сѓ", "С‚", "Рё", "Р·", "Р¶", "РЎ"
)


def looks_broken(s: str) -> bool:
    """
    Проверяет, похожа ли строка на битую кириллицу (mojibake)

    Args:
        s: Строка для проверки

    Returns:
        True если строка похожа на mojibake, иначе False
    """
    if not isinstance(s, str):
        return False

    # Если есть подсказки mojibake, но нет нормальной кириллицы
    has_mojibake_hints = any(h in s for h in MOJIBAKE_HINTS)
    has_normal_cyrillic = any('\u0400' <= ch <= '\u04FF' for ch in s)

    return has_mojibake_hints and not has_normal_cyrillic


def try_fix_str(s: str) -> str:
    """
    Пытается исправить битую кириллицу

    Механизм: строка была сохранена как UTF-8, но прочитана как latin1.
    Решение: .encode('latin1', errors='ignore').decode('utf-8', errors='ignore')

    Args:
        s: Строка для исправления

    Returns:
        Исправленная строка или оригинал если не удалось
    """
    if not isinstance(s, str) or not looks_broken(s):
        return s

    try:
        fixed = s.encode('latin1', errors='ignore').decode('utf-8', errors='ignore')
        # Проверяем что получилось что-то лучше
        if fixed and not looks_broken(fixed):
            return fixed
        return s
    except Exception:
        return s


def fix_text_fields(obj, field_names):
    """
    Исправляет текстовые поля объекта модели Django

    Args:
        obj: Экземпляр модели Django
        field_names: Список имён полей для проверки

    Returns:
        Количество исправленных полей
    """
    fixed_count = 0

    for field_name in field_names:
        try:
            value = getattr(obj, field_name, None)
            if value and isinstance(value, str) and looks_broken(value):
                fixed_value = try_fix_str(value)
                if fixed_value != value:
                    setattr(obj, field_name, fixed_value)
                    fixed_count += 1
        except Exception:
            continue

    return fixed_count
