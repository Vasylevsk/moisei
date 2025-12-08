#!/usr/bin/env node

/**
 * Optimize all menu images to WebP format
 * Creates optimized 200px and 100px versions for menu items
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp is not installed. Please run: npm install sharp --save-dev');
  process.exit(1);
}

const menuDirs = [
  'assets/images/food-menu',
  'assets/images/drink-menu',
  'assets/images/hookah-menu'
];

async function optimizeMenuImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'].includes(ext)) {
    return;
  }

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const outputBase = path.join(dir, `${baseName}.webp`);
  const output200 = path.join(dir, `${baseName}-200.webp`);
  const output100 = path.join(dir, `${baseName}-100.webp`);

  // Skip if already optimized
  if (fs.existsSync(output100)) {
    return;
  }

  try {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`\n🖼️  Processing: ${path.basename(filePath)} (${sizeMB} MB)`);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Create 200px version (for larger displays)
    await image
      .clone()
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(output200);

    const stats200 = fs.statSync(output200);
    console.log(`   ✅ Created 200px: ${path.basename(output200)} (${(stats200.size / 1024).toFixed(1)} KB)`);

    // Create 100px version (for menu items)
    await image
      .clone()
      .resize(100, 100, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(output100);

    const stats100 = fs.statSync(output100);
    const savings = ((1 - stats100.size / stats.size) * 100).toFixed(1);
    console.log(`   ✅ Created 100px: ${path.basename(output100)} (${(stats100.size / 1024).toFixed(1)} KB, ${savings}% smaller)`);

    // Also create full-size WebP for potential future use
    await image
      .clone()
      .webp({ quality: 85 })
      .toFile(outputBase);

    const statsFull = fs.statSync(outputBase);
    console.log(`   ✅ Created full: ${path.basename(outputBase)} (${(statsFull.size / 1024 / 1024).toFixed(2)} MB)`);

  } catch (error) {
    console.error(`   ❌ Error processing ${path.basename(filePath)}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'].includes(ext);
  });

  console.log(`\n📁 Processing directory: ${dirPath} (${imageFiles.length} images)`);

  for (const file of imageFiles) {
    const filePath = path.join(dirPath, file);
    await optimizeMenuImage(filePath);
  }
}

async function main() {
  console.log('🚀 Starting menu images optimization...\n');

  for (const dir of menuDirs) {
    await processDirectory(dir);
  }

  console.log('\n✨ Menu images optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update HTML files to use WebP versions (100px for menu items)');
  console.log('   2. Test the website to ensure images load correctly');
}

main().catch(console.error);

