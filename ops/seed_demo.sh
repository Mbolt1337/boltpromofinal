#!/bin/bash

# Скрипт для наполнения БД демо-данными
# Usage: ./ops/seed_demo.sh

set -e  # Exit on any error

echo "=== BoltPromo Demo Data Seeder ==="
echo ""

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Подтверждение
echo "This will populate the database with demo data."
read -p "Continue? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "Seeding cancelled."
    exit 0
fi

echo ""
echo "Running seed_demo management command..."
cd backend

# Запускаем команду наполнения БД
python manage.py seed_demo

cd ..

echo ""
echo "✅ Demo data seeded successfully!"
echo ""
echo "Created:"
echo "  - Categories"
echo "  - Stores"
echo "  - Promocodes"
echo "  - Showcases"
echo "  - Banners"
echo ""
echo "You can now access the application with sample data."
echo "Done!"
