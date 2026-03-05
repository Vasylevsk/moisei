# Инструкция по деплою события FIЇNKA

## Вариант 1: Автоматический деплой с локальной машины (требует SSH доступ)

Если у вас настроен SSH доступ к серверу, используйте скрипт:

```bash
./deploy-server.sh ваш_пользователь@moisei.uk /var/www/moisei
```

Или если путь другой:
```bash
./deploy-server.sh ваш_пользователь@IP_адрес /var/www/moisei
```

## Вариант 2: Ручной деплой на сервере (рекомендуется)

### 1. Подключитесь к серверу:
```bash
ssh ваш_пользователь@moisei.uk
```

### 2. Перейдите в директорию проекта:
```bash
cd /var/www/moisei
```

### 3. Запустите скрипт обновления:
```bash
bash update-server.sh
```

Или выполните команды вручную:

```bash
# Получить изменения
git pull origin master

# Перезагрузить nginx
sudo systemctl reload nginx

# Перезапустить PHP-FPM (если используется)
sudo systemctl restart php-fpm
# или
sudo systemctl restart php8.1-fpm

# Проверить права доступа
sudo chown -R www-data:www-data .
# или
sudo chown -R nginx:nginx .

# Проверить файлы
ls -lh finka-event.html
ls -lh assets/images/events/Finka/IMG_8456.webp
```

## Вариант 3: Минимальный деплой (только самое необходимое)

```bash
cd /var/www/moisei
git pull origin master
sudo systemctl reload nginx
```

## Проверка после деплоя:

1. Откройте в браузере: https://moisei.uk/finka-event.html
2. Проверьте главную страницу: https://moisei.uk/ (должно быть событие FIЇNKA)
3. Очистите кеш браузера (Ctrl+Shift+Delete) или используйте режим инкогнито
4. Если используется CDN (Cloudflare), очистите кеш через панель управления

## Очистка кеша браузера:

- **Chrome/Edge**: Ctrl+Shift+Delete (Windows) или Cmd+Shift+Delete (Mac)
- **Firefox**: Ctrl+Shift+Delete (Windows) или Cmd+Shift+Delete (Mac)
- **Safari**: Cmd+Option+E (Mac)

## Если что-то не работает:

1. Проверьте логи nginx: `sudo tail -f /var/log/nginx/error.log`
2. Проверьте права доступа: `ls -la finka-event.html`
3. Проверьте, что файлы обновились: `git log -1`
4. Перезагрузите nginx вручную: `sudo systemctl restart nginx`
