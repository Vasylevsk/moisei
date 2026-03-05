#!/bin/bash

# Скрипт для обновления на сервере с очисткой кеша
# Запустите этот скрипт ПРЯМО НА СЕРВЕРЕ в директории проекта

set -e  # Остановить при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начало автоматического обновления с очисткой кеша...${NC}"

# Определяем путь к проекту
WEBSITE_PATH="${PWD}"
echo -e "${GREEN}📁 Текущая директория: $WEBSITE_PATH${NC}"

# Шаг 1: Получение изменений из GitHub
echo -e "${BLUE}📥 Шаг 1: Получение изменений из GitHub...${NC}"
git pull origin master || {
    echo -e "${RED}❌ Ошибка при получении изменений${NC}"
    exit 1
}

# Шаг 2: Проверка новых файлов
echo -e "${BLUE}🔍 Шаг 2: Проверка новых файлов...${NC}"
if [ -f "finka-event.html" ]; then
    echo -e "${GREEN}✅ finka-event.html найден${NC}"
else
    echo -e "${YELLOW}⚠️  finka-event.html не найден${NC}"
fi

if [ -f "assets/images/events/Finka/IMG_8456.webp" ]; then
    echo -e "${GREEN}✅ IMG_8456.webp найден${NC}"
else
    echo -e "${YELLOW}⚠️  IMG_8456.webp не найден${NC}"
fi

# Шаг 3: Очистка кеша nginx
echo -e "${BLUE}🔄 Шаг 3: Очистка кеша nginx...${NC}"
if command -v systemctl &> /dev/null; then
    sudo systemctl reload nginx 2>/dev/null && echo -e "${GREEN}✅ Nginx перезагружен${NC}" || {
        sudo service nginx reload 2>/dev/null && echo -e "${GREEN}✅ Nginx перезагружен (через service)${NC}" || {
            echo -e "${YELLOW}⚠️  Nginx нужно перезагрузить вручную: sudo systemctl reload nginx${NC}"
        }
    }
else
    echo -e "${YELLOW}⚠️  systemctl не найден, попробуйте: sudo service nginx reload${NC}"
fi

# Шаг 4: Перезапуск PHP-FPM (если используется)
echo -e "${BLUE}🔄 Шаг 4: Перезапуск PHP-FPM (если используется)...${NC}"
if command -v systemctl &> /dev/null; then
    sudo systemctl restart php-fpm 2>/dev/null && echo -e "${GREEN}✅ PHP-FPM перезапущен${NC}" || \
    sudo systemctl restart php8.1-fpm 2>/dev/null && echo -e "${GREEN}✅ PHP-FPM 8.1 перезапущен${NC}" || \
    sudo systemctl restart php8.2-fpm 2>/dev/null && echo -e "${GREEN}✅ PHP-FPM 8.2 перезапущен${NC}" || \
    sudo systemctl restart php8.3-fpm 2>/dev/null && echo -e "${GREEN}✅ PHP-FPM 8.3 перезапущен${NC}" || \
    echo -e "${YELLOW}⚠️  PHP-FPM не используется или нужно перезапустить вручную${NC}"
else
    echo -e "${YELLOW}⚠️  PHP-FPM не используется${NC}"
fi

# Шаг 5: Проверка прав доступа
echo -e "${BLUE}🔐 Шаг 5: Проверка прав доступа к файлам...${NC}"
if [ -d "/var/www" ]; then
    sudo chown -R www-data:www-data . 2>/dev/null && echo -e "${GREEN}✅ Права доступа обновлены (www-data)${NC}" || \
    sudo chown -R nginx:nginx . 2>/dev/null && echo -e "${GREEN}✅ Права доступа обновлены (nginx)${NC}" || \
    echo -e "${YELLOW}⚠️  Права доступа нужно проверить вручную${NC}"
else
    echo -e "${YELLOW}⚠️  Не в директории /var/www, права доступа не изменены${NC}"
fi

# Шаг 6: Очистка кеша Redis (если используется)
echo -e "${BLUE}🗑️  Шаг 6: Очистка кеша Redis (если используется)...${NC}"
if command -v systemctl &> /dev/null; then
    sudo systemctl restart redis 2>/dev/null && echo -e "${GREEN}✅ Redis перезапущен${NC}" || \
    echo -e "${YELLOW}⚠️  Redis не используется${NC}"
else
    echo -e "${YELLOW}⚠️  Redis не используется${NC}"
fi

# Шаг 7: Очистка кеша Memcached (если используется)
echo -e "${BLUE}🗑️  Шаг 7: Очистка кеша Memcached (если используется)...${NC}"
if command -v systemctl &> /dev/null; then
    sudo systemctl restart memcached 2>/dev/null && echo -e "${GREEN}✅ Memcached перезапущен${NC}" || \
    echo -e "${YELLOW}⚠️  Memcached не используется${NC}"
else
    echo -e "${YELLOW}⚠️  Memcached не используется${NC}"
fi

# Шаг 8: Проверка Node.js сервера
echo -e "${BLUE}🔄 Шаг 8: Проверка Node.js сервера...${NC}"
if [ -d "server" ]; then
    echo -e "${YELLOW}Обнаружен Node.js сервер${NC}"
    if command -v pm2 &> /dev/null; then
        pm2 restart moisei 2>/dev/null && echo -e "${GREEN}✅ PM2 сервер перезапущен${NC}" || \
        echo -e "${YELLOW}⚠️  PM2 сервер нужно перезапустить вручную${NC}"
    elif command -v systemctl &> /dev/null; then
        sudo systemctl restart moisei 2>/dev/null && echo -e "${GREEN}✅ Systemd сервер перезапущен${NC}" || \
        echo -e "${YELLOW}⚠️  Systemd сервер нужно перезапустить вручную${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js сервер нужно перезапустить вручную${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Node.js сервер не используется${NC}"
fi

# Финальная проверка
echo -e "${BLUE}✅ Шаг 9: Финальная проверка...${NC}"
echo -e "${GREEN}📄 Проверка файлов:${NC}"
ls -lh finka-event.html index.html 2>/dev/null | head -2

echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo -e "${YELLOW}📝 Рекомендации:${NC}"
echo -e "   1. Проверьте доступность страницы: https://moisei.uk/finka-event.html"
echo -e "   2. Проверьте главную страницу: https://moisei.uk/"
echo -e "   3. Очистите кеш браузера (Ctrl+Shift+Delete) или используйте режим инкогнито"
echo -e "   4. Если используется CDN (Cloudflare и т.д.), очистите кеш через панель управления"
echo -e "   5. Проверьте логи nginx: sudo tail -f /var/log/nginx/error.log"
