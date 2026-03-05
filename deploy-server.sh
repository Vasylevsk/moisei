#!/bin/bash

# Скрипт для автоматического деплоя на сервер с очисткой кеша
# Использование: ./deploy-server.sh [ssh_user@host] [path_to_website]

set -e  # Остановить при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начало автоматического деплоя с очисткой кеша...${NC}"

# Параметры
SSH_HOST="${1:-}"
WEBSITE_PATH="${2:-/var/www/moisei}"

if [ -z "$SSH_HOST" ]; then
    echo -e "${YELLOW}Использование: ./deploy-server.sh user@host [path_to_website]${NC}"
    echo -e "${YELLOW}Пример: ./deploy-server.sh user@moisei.uk /var/www/moisei${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Подключение к серверу: $SSH_HOST${NC}"
echo -e "${GREEN}📁 Путь на сервере: $WEBSITE_PATH${NC}"

# Проверка подключения
echo -e "${YELLOW}Проверка подключения...${NC}"
ssh -o ConnectTimeout=5 "$SSH_HOST" "echo '✅ Подключение успешно'" || {
    echo -e "${RED}❌ Ошибка подключения к серверу${NC}"
    exit 1
}

# Деплой
echo -e "${BLUE}📥 Шаг 1: Получение изменений из GitHub...${NC}"
ssh "$SSH_HOST" "cd $WEBSITE_PATH && git pull origin master" || {
    echo -e "${RED}❌ Ошибка при получении изменений${NC}"
    exit 1
}

# Проверка новых файлов
echo -e "${BLUE}🔍 Шаг 2: Проверка новых файлов...${NC}"
ssh "$SSH_HOST" "cd $WEBSITE_PATH && ls -lh finka-event.html 2>/dev/null && ls -lh assets/images/events/Finka/IMG_8456.webp 2>/dev/null" || {
    echo -e "${YELLOW}⚠️  Некоторые файлы могут отсутствовать${NC}"
}

# Очистка кеша nginx
echo -e "${BLUE}🔄 Шаг 3: Очистка кеша nginx...${NC}"
ssh "$SSH_HOST" "sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null || echo '⚠️  Nginx нужно перезагрузить вручную'" || {
    echo -e "${YELLOW}⚠️  Не удалось перезагрузить nginx автоматически${NC}"
}

# Очистка кеша PHP-FPM (если используется)
echo -e "${BLUE}🔄 Шаг 4: Перезапуск PHP-FPM (если используется)...${NC}"
ssh "$SSH_HOST" "sudo systemctl restart php-fpm 2>/dev/null || sudo systemctl restart php8.1-fpm 2>/dev/null || sudo systemctl restart php8.2-fpm 2>/dev/null || echo '⚠️  PHP-FPM не используется или нужно перезапустить вручную'" || {
    echo -e "${YELLOW}⚠️  PHP-FPM не используется или не удалось перезапустить${NC}"
}

# Проверка прав доступа
echo -e "${BLUE}🔐 Шаг 5: Проверка прав доступа к файлам...${NC}"
ssh "$SSH_HOST" "cd $WEBSITE_PATH && sudo chown -R www-data:www-data . 2>/dev/null || sudo chown -R nginx:nginx . 2>/dev/null || sudo chown -R \$(whoami):\$(whoami) . 2>/dev/null || echo '⚠️  Права доступа нужно проверить вручную'" || {
    echo -e "${YELLOW}⚠️  Не удалось изменить права доступа автоматически${NC}"
}

# Очистка кеша Redis (если используется)
echo -e "${BLUE}🗑️  Шаг 6: Очистка кеша Redis (если используется)...${NC}"
ssh "$SSH_HOST" "sudo systemctl restart redis 2>/dev/null || echo '⚠️  Redis не используется'" || {
    echo -e "${YELLOW}⚠️  Redis не используется${NC}"
}

# Очистка кеша Memcached (если используется)
echo -e "${BLUE}🗑️  Шаг 7: Очистка кеша Memcached (если используется)...${NC}"
ssh "$SSH_HOST" "sudo systemctl restart memcached 2>/dev/null || echo '⚠️  Memcached не используется'" || {
    echo -e "${YELLOW}⚠️  Memcached не используется${NC}"
}

# Если есть Node.js сервер
echo -e "${BLUE}🔄 Шаг 8: Проверка Node.js сервера...${NC}"
if ssh "$SSH_HOST" "test -d $WEBSITE_PATH/server"; then
    echo -e "${YELLOW}Обнаружен Node.js сервер${NC}"
    ssh "$SSH_HOST" "cd $WEBSITE_PATH/server && pm2 restart moisei 2>/dev/null || systemctl restart moisei 2>/dev/null || echo '⚠️  Node.js сервер нужно перезапустить вручную'"
fi

# Финальная проверка
echo -e "${BLUE}✅ Шаг 9: Финальная проверка...${NC}"
ssh "$SSH_HOST" "cd $WEBSITE_PATH && echo '📄 Проверка файлов:' && ls -lh finka-event.html index.html 2>/dev/null | head -2"

echo -e "${GREEN}✅ Деплой завершен!${NC}"
echo -e "${YELLOW}📝 Рекомендации:${NC}"
echo -e "   1. Проверьте доступность страницы: https://moisei.uk/finka-event.html"
echo -e "   2. Проверьте главную страницу: https://moisei.uk/"
echo -e "   3. Очистите кеш браузера (Ctrl+Shift+Delete) или используйте режим инкогнито"
echo -e "   4. Если используется CDN (Cloudflare и т.д.), очистите кеш через панель управления"
echo -e "   5. Проверьте логи nginx: sudo tail -f /var/log/nginx/error.log"
