#!/bin/bash

# Скрипт для деплоя на сервер
# Использование: ./deploy.sh [ssh_user@host] [path_to_website]

set -e  # Остановить при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начало деплоя...${NC}"

# Параметры
SSH_HOST="${1:-}"
WEBSITE_PATH="${2:-/var/www/moisei.uk}"

if [ -z "$SSH_HOST" ]; then
    echo -e "${YELLOW}Использование: ./deploy.sh user@host [path_to_website]${NC}"
    echo -e "${YELLOW}Пример: ./deploy.sh user@moisei.uk /var/www/moisei.uk${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Подключение к серверу: $SSH_HOST${NC}"
echo -e "${GREEN}📁 Путь на сервере: $WEBSITE_PATH${NC}"

# Проверка подключения
echo -e "${YELLOW}Проверка подключения...${NC}"
ssh -o ConnectTimeout=5 "$SSH_HOST" "echo 'Подключение успешно'" || {
    echo -e "${RED}❌ Ошибка подключения к серверу${NC}"
    exit 1
}

# Деплой
echo -e "${GREEN}📥 Получение изменений из GitHub...${NC}"
ssh "$SSH_HOST" "cd $WEBSITE_PATH && git pull origin master" || {
    echo -e "${RED}❌ Ошибка при получении изменений${NC}"
    exit 1
}

# Проверка favicon файлов
echo -e "${GREEN}🔍 Проверка favicon файлов...${NC}"
ssh "$SSH_HOST" "cd $WEBSITE_PATH && ls -lh favicon* 2>/dev/null | head -10" || {
    echo -e "${YELLOW}⚠️  Некоторые favicon файлы могут отсутствовать${NC}"
}

# Если есть Node.js сервер
echo -e "${GREEN}🔄 Проверка Node.js сервера...${NC}"
if ssh "$SSH_HOST" "test -d $WEBSITE_PATH/server"; then
    echo -e "${YELLOW}Обнаружен Node.js сервер${NC}"
    read -p "Перезапустить сервер? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🔄 Перезапуск сервера...${NC}"
        ssh "$SSH_HOST" "cd $WEBSITE_PATH/server && npm install 2>/dev/null; pm2 restart moisei 2>/dev/null || systemctl restart moisei 2>/dev/null || echo 'Сервер нужно перезапустить вручную'"
    fi
fi

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo -e "${YELLOW}📝 Не забудьте:${NC}"
echo -e "   1. Проверить доступность файлов: https://moisei.uk/favicon.ico"
echo -e "   2. Запросить переиндексацию в Google Search Console"
echo -e "   3. Очистить кэш браузера для проверки"




