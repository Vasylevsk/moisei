const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

// Размеры favicon согласно рекомендациям Google
const sizes = [16, 32, 48, 96, 144, 192, 512];

async function generateFavicons() {
  const svgPath = path.join(__dirname, 'favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Генерация PNG favicon файлов...');

  // Генерируем PNG файлы разных размеров
  for (const size of sizes) {
    const outputPath = path.join(__dirname, `favicon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 26, g: 26, b: 26, alpha: 1 } // #1a1a1a
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Создан favicon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Ошибка при создании favicon-${size}x${size}.png:`, error.message);
    }
  }

  // Создаем favicon.ico (16x16 и 32x32 в одном файле)
  try {
    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .png()
      .toBuffer();

    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      })
      .png()
      .toBuffer();

    // Создаем .ico файл с несколькими размерами
    const icoBuffer = await toIco([favicon16, favicon32]);
    fs.writeFileSync(path.join(__dirname, 'favicon.ico'), icoBuffer);
    console.log('✓ Создан favicon.ico (16x16 и 32x32)');
  } catch (error) {
    console.error('✗ Ошибка при создании favicon.ico:', error.message);
  }

  console.log('\n✓ Все favicon файлы успешно созданы!');
}

generateFavicons().catch(console.error);

