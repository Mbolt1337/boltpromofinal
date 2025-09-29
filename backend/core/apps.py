from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'BoltPromo Core'

    def ready(self):
        from . import models

        def apply_labels(model, singular, plural, field_labels):
            model._meta.verbose_name = singular
            model._meta.verbose_name_plural = plural
            for field_name, label in field_labels.items():
                try:
                    model._meta.get_field(field_name).verbose_name = label
                except Exception:
                    continue

        apply_labels(
            models.Category,
            'Категория',
            'Категории',
            {
                'name': 'Название',
                'slug': 'Слаг',
                'description': 'Описание',
                'icon': 'Иконка',
                'is_active': 'Активна',
                'created_at': 'Создано',
                'updated_at': 'Обновлено',
            },
        )

        apply_labels(
            models.Store,
            'Магазин',
            'Магазины',
            {
                'name': 'Название',
                'slug': 'Слаг',
                'logo': 'Логотип',
                'rating': 'Рейтинг',
                'description': 'Описание',
                'site_url': 'Сайт',
                'is_active': 'Активен',
                'created_at': 'Создано',
                'updated_at': 'Обновлено',
            },
        )

        apply_labels(
            models.PromoCode,
            'Промокод',
            'Промокоды',
            {
                'title': 'Заголовок',
                'description': 'Описание',
                'offer_type': 'Тип предложения',
                'code': 'Промокод',
                'discount_value': 'Размер скидки',
                'discount_label': 'Метка скидки',
                'long_description': 'Подробности',
                'steps': 'Шаги',
                'fine_print': 'Условия',
                'disclaimer': 'Дисклеймер',
                'expires_at': 'Дата окончания',
                'affiliate_url': 'Партнёрская ссылка',
                'store': 'Магазин',
                'categories': 'Категории',
                'is_active': 'Активен',
                'is_hot': 'Горячий',
                'is_recommended': 'Рекомендованный',
                'views_count': 'Просмотры',
                'created_at': 'Создано',
                'updated_at': 'Обновлено',
            },
        )

        apply_labels(
            models.Banner,
            'Баннер',
            'Баннеры',
            {
                'title': 'Заголовок',
                'subtitle': 'Подзаголовок',
                'image': 'Изображение',
                'cta_text': 'Текст кнопки',
                'cta_url': 'Ссылка',
                'is_active': 'Активен',
                'sort_order': 'Порядок сортировки',
                'created_at': 'Создано',
            },
        )

        apply_labels(
            models.Partner,
            'Партнёр',
            'Партнёры',
            {
                'name': 'Название',
                'logo': 'Логотип',
                'url': 'Ссылка',
                'order': 'Порядок',
                'is_active': 'Активен',
                'created_at': 'Создано',
            },
        )

        apply_labels(
            models.StaticPage,
            'Статическая страница',
            'Статические страницы',
            {
                'slug': 'Слаг',
                'title': 'Заголовок',
                'content': 'Содержимое',
                'is_active': 'Активна',
                'updated_at': 'Обновлено',
            },
        )

        apply_labels(
            models.ContactMessage,
            'Обращение',
            'Обращения',
            {
                'name': 'Имя',
                'email': 'Email',
                'subject': 'Тема',
                'message': 'Сообщение',
                'page': 'Страница',
                'user_agent': 'User-Agent',
                'ip_address': 'IP адрес',
                'is_processed': 'Обработано',
                'processed_at': 'Время обработки',
                'is_spam': 'Спам',
                'created_at': 'Создано',
            },
        )
