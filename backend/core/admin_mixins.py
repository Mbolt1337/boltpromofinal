"""
Миксины для админ-форм
"""
from django import forms
from .utils.encoding import try_fix_str, looks_broken


class AntiMojibakeModelForm(forms.ModelForm):
    """
    Миксин для защиты админ-форм от кракозябр.

    Автоматически проверяет все текстовые поля на mojibake
    и пытается их исправить перед сохранением.

    Usage:
        class MyAdminForm(AntiMojibakeModelForm):
            class Meta:
                model = MyModel
                fields = '__all__'

        @admin.register(MyModel)
        class MyModelAdmin(admin.ModelAdmin):
            form = MyAdminForm
    """

    def clean(self):
        cleaned = super().clean()

        # Проходим по всем полям и проверяем строки
        for field_name, value in list(cleaned.items()):
            if isinstance(value, str) and looks_broken(value):
                # Пытаемся исправить
                fixed_value = try_fix_str(value)
                cleaned[field_name] = fixed_value

                # Можно добавить warning для администратора
                # self.add_warning(f'Поле "{field_name}" содержало битую кодировку и было исправлено.')

        return cleaned
