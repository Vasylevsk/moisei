# File Hash Versioning

Система версионирования файлов на основе MD5 хешей для решения проблем с кешированием в браузерах.

## Как это работает

1. Скрипт вычисляет MD5 хеш для каждого файла (CSS, JS)
2. Хеш добавляется как query параметр `?v=xxxxx` к URL файла
3. При изменении файла хеш меняется, браузер загружает новую версию
4. Файлы с версией кешируются на 1 год (immutable)

## Использование

### Автоматическое версионирование после сборки

```bash
npm run build
```

Эта команда:
1. Собирает CSS (`combine-css` + `minify-css`)
2. Автоматически версионирует все файлы (`version-assets`)

### Только версионирование

```bash
npm run version-assets
```

### Только сборка CSS

```bash
npm run build-css
```

## Версионируемые файлы

- `assets/css/combined.min.css`
- `assets/js/booking.js`
- `assets/js/script.js`
- `assets/js/translations.js`
- `assets/js/food-menu.js`
- `assets/js/drink-menu.js`

## Обновляемые HTML файлы

- `index.html`
- `reservation.html`
- `food-menu.html`
- `drink-menu.html`
- `hookah-menu.html`

## Пример

До версионирования:
```html
<link rel="stylesheet" href="./assets/css/combined.min.css" />
<script src="./assets/js/script.js"></script>
```

После версионирования:
```html
<link rel="stylesheet" href="./assets/css/combined.min.css?v=9c1f26bd" />
<script src="./assets/js/script.js?v=5f7cd395"></script>
```

## Настройка кеширования

Файл `.htaccess` настроен так, что:
- Файлы **с версией** (`?v=xxx`) кешируются на 1 год (`max-age=31536000, immutable`)
- Файлы **без версии** не кешируются (`max-age=0, must-revalidate`)
- HTML файлы не кешируются

## Рабочий процесс

1. Внесите изменения в CSS или JS файлы
2. Запустите `npm run build` (соберет CSS и обновит версии)
3. Закоммитьте изменения
4. Запушьте на сервер
5. Браузеры автоматически загрузят новые версии файлов

## На сервере

После `git pull` на сервере:

```bash
cd /var/www/moisei
git pull origin master
npm run build
sudo systemctl reload nginx
```

## Преимущества

✅ Решает проблему кеширования на мобильных браузерах  
✅ Автоматическое обновление версий при изменении файлов  
✅ Долгое кеширование для файлов с версией (лучшая производительность)  
✅ Нет необходимости в ручном обновлении версий  

