#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Файлы для версионирования
const assetsToVersion = [
  { 
    file: 'assets/css/combined.min.css', 
    patterns: [
      /combined\.min\.css(\?v=[\w-]+)?/g,
      /\.\/assets\/css\/combined\.min\.css(\?v=[\w-]+)?/g,
      /assets\/css\/combined\.min\.css(\?v=[\w-]+)?/g
    ]
  },
  { 
    file: 'assets/js/booking.js', 
    patterns: [
      /booking\.js(\?v=[\w-]+)?/g,
      /\.\/assets\/js\/booking\.js(\?v=[\w-]+)?/g,
      /assets\/js\/booking\.js(\?v=[\w-]+)?/g
    ]
  },
  { 
    file: 'assets/js/script.js', 
    patterns: [
      /script\.js(\?v=[\w-]+)?/g,
      /\.\/assets\/js\/script\.js(\?v=[\w-]+)?/g,
      /assets\/js\/script\.js(\?v=[\w-]+)?/g
    ]
  },
  { 
    file: 'assets/js/translations.js', 
    patterns: [
      /translations\.js(\?v=[\w-]+)?/g,
      /\.\/assets\/js\/translations\.js(\?v=[\w-]+)?/g,
      /assets\/js\/translations\.js(\?v=[\w-]+)?/g
    ]
  },
  { 
    file: 'assets/js/food-menu.js', 
    patterns: [
      /food-menu\.js(\?v=[\w-]+)?/g,
      /\.\/assets\/js\/food-menu\.js(\?v=[\w-]+)?/g,
      /assets\/js\/food-menu\.js(\?v=[\w-]+)?/g
    ]
  },
  { 
    file: 'assets/js/drink-menu.js', 
    patterns: [
      /drink-menu\.js(\?v=[\w-]+)?/g,
      /\.\/assets\/js\/drink-menu\.js(\?v=[\w-]+)?/g,
      /assets\/js\/drink-menu\.js(\?v=[\w-]+)?/g
    ]
  },
];

// HTML файлы для обновления
const htmlFiles = [
  'index.html',
  'reservation.html',
  'food-menu.html',
  'drink-menu.html',
  'hookah-menu.html'
];

/**
 * Вычисляет MD5 хеш файла
 */
function getFileHash(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return null;
  }
  
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex').substring(0, 8); // Используем первые 8 символов
}

/**
 * Обновляет версии в HTML файле
 */
function updateHtmlFile(htmlPath, versions) {
  if (!fs.existsSync(htmlPath)) {
    console.warn(`⚠️  HTML file not found: ${htmlPath}`);
    return false;
  }

  let content = fs.readFileSync(htmlPath, 'utf8');
  let updated = false;

  // Обновляем каждый файл с его версией
  assetsToVersion.forEach(({ file, patterns }) => {
    const version = versions[file];
    if (!version) return;

    const fileName = path.basename(file);
    const fileDir = path.dirname(file).replace('assets/', '');
    
    // Пробуем разные форматы путей
    const replacements = [
      { pattern: `${fileName}?v=`, replacement: `${fileName}?v=${version}` },
      { pattern: `./assets/${fileDir}/${fileName}`, replacement: `./assets/${fileDir}/${fileName}?v=${version}` },
      { pattern: `assets/${fileDir}/${fileName}`, replacement: `assets/${fileDir}/${fileName}?v=${version}` },
    ];

    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        // Заменяем все вхождения с версией или без
        content = content.replace(pattern, (match) => {
          // Если уже есть версия, заменяем её
          if (match.includes('?v=')) {
            return match.replace(/\?v=[\w-]+/, `?v=${version}`);
          }
          // Если версии нет, добавляем
          return match.replace(fileName, `${fileName}?v=${version}`);
        });
        updated = true;
      }
    });
  });

  if (updated) {
    fs.writeFileSync(htmlPath, content, 'utf8');
    return true;
  }

  return false;
}

/**
 * Главная функция
 */
function main() {
  console.log('🔄 Starting file versioning...\n');

  // Вычисляем хеши для всех файлов
  const versions = {};
  const versionMap = {};

  assetsToVersion.forEach(({ file }) => {
    const filePath = path.join(__dirname, file);
    const hash = getFileHash(filePath);
    
    if (hash) {
      versions[file] = hash;
      versionMap[file] = hash;
      console.log(`✅ ${file}: ${hash}`);
    }
  });

  if (Object.keys(versions).length === 0) {
    console.error('❌ No files found to version!');
    process.exit(1);
  }

  console.log('\n📝 Updating HTML files...\n');

  // Обновляем все HTML файлы
  let updatedCount = 0;
  htmlFiles.forEach(htmlFile => {
    const htmlPath = path.join(__dirname, htmlFile);
    if (updateHtmlFile(htmlPath, versions)) {
      console.log(`✅ Updated: ${htmlFile}`);
      updatedCount++;
    } else {
      console.log(`⚠️  No changes: ${htmlFile}`);
    }
  });

  console.log(`\n✨ Versioning complete!`);
  console.log(`📊 Updated ${updatedCount} HTML file(s)`);
  console.log(`\n📋 Version summary:`);
  Object.entries(versions).forEach(([file, version]) => {
    console.log(`   ${path.basename(file)}: v=${version}`);
  });
}

// Запускаем
main();

