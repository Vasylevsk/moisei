#!/bin/bash

# Скрипт для пуша изменений в git с обходом кеша

echo "🚀 Добавляем все изменения..."
git add -A

echo "📝 Создаем коммит..."
git commit -m "TEMPORARY: Google Ads changes - replace Hookah with Lounge, add favicon versioning, update cache busting

⚠️ ВРЕМЕННЫЕ ИЗМЕНЕНИЯ ДЛЯ GOOGLE ADS ⚠️
- Replaced all 'Hookah' with 'Lounge' in visible texts
- Replaced 'кальян' with 'лаунж' in Ukrainian texts  
- Replaced 'shisha' with 'lounge' in keywords
- Changed 'smoky clouds' to 'aromatic clouds'
- Removed 'smoking' from visible texts
- Added favicon versioning (?v=20250111) to bypass cache
- Updated CSS/JS versions for cache busting

Files changed:
- index.html
- hookah-menu.html
- reservation.html
- assets/js/translations.js

See TEMP_GOOGLE_ADS_CHANGES.md for rollback instructions"

echo "⬆️ Пушим в git..."
git push origin master

echo "✅ Готово! Изменения запушены."

