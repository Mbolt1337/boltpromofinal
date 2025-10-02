/**
 * Confirm dialogs для критических действий в админке
 * Подключается через JAZZMIN_SETTINGS['custom_js']
 */

(function() {
    'use strict';

    // Ждём полной загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {

        // 1. Подтверждение массового удаления
        const deleteSelectedButton = document.querySelector('button[name="_delete_selected"]');
        if (deleteSelectedButton) {
            deleteSelectedButton.addEventListener('click', function(e) {
                const selectedCount = document.querySelectorAll('input[name="_selected_action"]:checked').length;

                if (selectedCount === 0) {
                    alert('Выберите хотя бы один элемент для удаления');
                    e.preventDefault();
                    return;
                }

                const confirmed = confirm(
                    `Вы уверены, что хотите удалить ${selectedCount} элемент(ов)?\n\n` +
                    'Это действие необратимо!'
                );

                if (!confirmed) {
                    e.preventDefault();
                }
            });
        }

        // 2. Подтверждение удаления объекта (на странице редактирования)
        const deleteButton = document.querySelector('.deletelink, .deletelink-box a');
        if (deleteButton) {
            deleteButton.addEventListener('click', function(e) {
                const objectName = document.querySelector('h1')?.textContent || 'этот объект';

                const confirmed = confirm(
                    `Вы уверены, что хотите удалить "${objectName}"?\n\n` +
                    'Это действие необратимо!'
                );

                if (!confirmed) {
                    e.preventDefault();
                }
            });
        }

        // 3. Подтверждение для кнопки "Исправить кракозябры" (если есть)
        const fixEncodingButton = document.querySelector('a[href*="fix_encoding"]');
        if (fixEncodingButton) {
            fixEncodingButton.addEventListener('click', function(e) {
                const confirmed = confirm(
                    'Запустить исправление кракозябр?\n\n' +
                    'Это действие изменит все текстовые поля в базе данных.\n' +
                    'Рекомендуется создать резервную копию БД перед запуском.'
                );

                if (!confirmed) {
                    e.preventDefault();
                }
            });
        }

        // 4. Подтверждение для массовых действий (actions)
        const actionSelect = document.querySelector('select[name="action"]');
        const actionGoButton = document.querySelector('button[title="Выполнить"]');

        if (actionSelect && actionGoButton) {
            actionGoButton.addEventListener('click', function(e) {
                const actionValue = actionSelect.value;
                const selectedCount = document.querySelectorAll('input[name="_selected_action"]:checked').length;

                if (!actionValue || actionValue === '---------') {
                    return; // Django сам покажет ошибку
                }

                if (selectedCount === 0) {
                    alert('Выберите хотя бы один элемент для действия');
                    e.preventDefault();
                    return;
                }

                // Определяем опасные действия
                const dangerousActions = [
                    'delete_selected',
                    'activate',
                    'deactivate',
                    'mark_as_expired'
                ];

                const actionText = actionSelect.options[actionSelect.selectedIndex].text;

                if (dangerousActions.some(action => actionValue.includes(action))) {
                    const confirmed = confirm(
                        `Применить действие "${actionText}" к ${selectedCount} элемент(ам)?\n\n` +
                        'Продолжить?'
                    );

                    if (!confirmed) {
                        e.preventDefault();
                    }
                }
            });
        }

        // 5. Подтверждение для импорта промокодов (если на странице импорта)
        const importForm = document.querySelector('form[action*="import"]');
        if (importForm) {
            importForm.addEventListener('submit', function(e) {
                const fileInput = importForm.querySelector('input[type="file"]');

                if (fileInput && fileInput.files.length > 0) {
                    // На первом шаге не спрашиваем
                    return;
                }

                // На втором шаге (подтверждение импорта)
                const confirmButton = importForm.querySelector('button[name="confirm"]');
                if (confirmButton) {
                    const totalRows = document.querySelectorAll('.import-row').length;

                    const confirmed = confirm(
                        `Импортировать ${totalRows} промокод(ов)?\n\n` +
                        'Дубликаты будут обновлены, новые записи добавлены.'
                    );

                    if (!confirmed) {
                        e.preventDefault();
                    }
                }
            });
        }

        // 6. Визуальная индикация опасных кнопок
        const dangerousButtons = document.querySelectorAll(
            '.deletelink, .deletelink-box a, button[name="_delete_selected"]'
        );

        dangerousButtons.forEach(function(btn) {
            btn.style.transition = 'all 0.2s ease';

            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.4)';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
        });

        console.log('✓ Admin confirm dialogs loaded');
    });
})();
