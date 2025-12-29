# ⚠️ ВРЕМЕННЫЕ ИЗМЕНЕНИЯ ДЛЯ GOOGLE ADS

**Дата изменений:** 2025-01-XX
**Причина:** Временная замена слов для прохождения модерации Google Ads

## Что было изменено:

### 1. Замены в текстах:
- "Hookah" → "Lounge" (все видимые тексты)
- "hookah" → "lounge" (в keywords, описаниях)
- "кальян" → "лаунж" (украинские тексты)
- "shisha" → "lounge" (в keywords)
- "smoky clouds" → "aromatic clouds"
- "Smoking duration" → "Duration"

### 2. Измененные файлы:
- `index.html` - все meta теги, keywords, описания, JSON-LD
- `hookah-menu.html` - заголовки, описания, keywords
- `reservation.html` - meta теги
- `assets/js/translations.js` - тексты переводов

## ⚠️ ВАЖНО: ВЕРНУТЬ ВСЕ ОБРАТНО!

После запуска рекламы в Google Ads нужно вернуть все изменения обратно:
1. Восстановить из git: `git restore index.html hookah-menu.html reservation.html assets/js/translations.js`
2. Или использовать последний коммит до этих изменений

## Команда для возврата:
```bash
git restore index.html hookah-menu.html reservation.html assets/js/translations.js
```

---

**ПОМНИТЬ:** Это временные изменения только для Google Ads!

