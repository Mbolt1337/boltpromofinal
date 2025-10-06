# BoltPromo Backup Scripts

Автоматические скрипты для резервного копирования базы данных PostgreSQL.

## Файлы

- **backup_db.sh** - Bash скрипт для Linux/macOS
- **backup_db.bat** - Batch скрипт для Windows

## Использование

### Linux/macOS

```bash
# Сделать скрипт исполняемым
chmod +x backend/scripts/backup_db.sh

# Запустить backup
./backend/scripts/backup_db.sh

# Или с пользовательскими параметрами
BACKUP_DIR=/custom/path DB_NAME=mydb ./backend/scripts/backup_db.sh
```

### Windows

```cmd
# Запустить backup
backend\scripts\backup_db.bat

# Или установить переменные перед запуском
set BACKUP_DIR=D:\backups\boltpromo
set DB_NAME=boltpromo
backend\scripts\backup_db.bat
```

## Переменные окружения

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `BACKUP_DIR` | `/var/backups/boltpromo` (Linux) или `C:\backups\boltpromo` (Windows) | Директория для сохранения бэкапов |
| `RETENTION_DAYS` | `30` | Количество дней хранения старых бэкапов |
| `DB_NAME` | `boltpromo` | Имя базы данных |
| `DB_USER` | `postgres` | Пользователь PostgreSQL |
| `DB_HOST` | `localhost` | Хост PostgreSQL |
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DB_PASSWORD` | *(из .env)* | Пароль PostgreSQL |
| `S3_BUCKET` | *(пусто)* | S3 bucket для remote backup (только Linux) |
| `ENABLE_S3_UPLOAD` | `false` | Включить загрузку в S3 (только Linux) |

## Автоматизация с Cron (Linux/macOS)

```bash
# Редактировать crontab
crontab -e

# Добавить строку для ежедневного backup в 2:00 AM
0 2 * * * /path/to/backend/scripts/backup_db.sh >> /var/log/boltpromo/backup.log 2>&1
```

## Автоматизация с Task Scheduler (Windows)

1. Открыть Task Scheduler
2. Создать новую задачу (Create Basic Task)
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program/script: `C:\path\to\backend\scripts\backup_db.bat`
6. Start in: `C:\path\to\backend\scripts\`

## Восстановление из backup

### Linux/macOS

```bash
# Восстановить из backup
pg_restore -h localhost -U postgres -d boltpromo -c /path/to/backup.sql.gz
```

### Windows

```cmd
# Восстановить из backup
pg_restore -h localhost -U postgres -d boltpromo -c C:\path\to\backup.sql
```

## Проверка integrity backup

```bash
# Проверить файл на повреждения
pg_restore --list /path/to/backup.sql.gz

# Тестовое восстановление в временную БД
createdb boltpromo_test
pg_restore -d boltpromo_test /path/to/backup.sql.gz
dropdb boltpromo_test
```

## Мониторинг

Скрипты логируют все операции с timestamp. Для мониторинга рекомендуется:

1. Настроить email уведомления при ошибках
2. Использовать monitoring tools (Prometheus, Grafana)
3. Регулярно проверять размер и количество бэкапов

## Безопасность

⚠️ **ВАЖНО:**

- Никогда не храните `DB_PASSWORD` в скрипте
- Используйте `.pgpass` файл для автоматической аутентификации
- Ограничьте права доступа: `chmod 600 ~/.pgpass`
- Шифруйте бэкапы при хранении в S3

### Пример .pgpass

```
# ~/.pgpass (Linux/macOS)
localhost:5432:boltpromo:postgres:your_password

# Установить права
chmod 600 ~/.pgpass
```

## Troubleshooting

### Ошибка: pg_dump: command not found

Установите PostgreSQL client tools:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS (Homebrew)
brew install postgresql
```

### Ошибка: Permission denied

```bash
# Сделать скрипт исполняемым
chmod +x backend/scripts/backup_db.sh

# Проверить права на директорию
sudo chown -R $USER:$USER /var/backups/boltpromo
```

### Ошибка: authentication failed

Проверьте переменные `DB_USER` и `DB_PASSWORD` в `.env` файле.

## См. также

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [AWS CLI S3 Documentation](https://docs.aws.amazon.com/cli/latest/reference/s3/)
