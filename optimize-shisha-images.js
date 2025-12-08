#!/usr/bin/env node

/**
 * Optimize shisha images to WebP format
 * Creates optimized 600px, 400px, and 200px versions for shisha images
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

const menuDir = path.join(__dirname, 'assets/images/food-menu');
const shishaImages = [
  'shisha 1.JPG',
  'shisha 2.JPG',
  'shisha 5.JPG'
];

async function optimizeShishaImage(fileName) {
  const filePath = path.join(menuDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }

  const baseName = path.basename(fileName, path.extname(fileName));
  const output600 = path.join(menuDir, `${baseName}-600.webp`);
  const output400 = path.join(menuDir, `${baseName}-400.webp`);

  try {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`\n🖼️  Processing: ${fileName} (${sizeMB} MB)`);

    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Generate 600px version
    if (!fs.existsSync(output600)) {
      await image
        .clone()
        .resize(600, 600, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(output600);
      
      const outputStats = fs.statSync(output600);
      const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
      console.log(`   ✅ Created: ${path.basename(output600)} (${outputSizeMB} MB)`);
    } else {
      console.log(`   ⏭️  Skipped: ${path.basename(output600)} (already exists)`);
    }

    // Generate 400px version
    if (!fs.existsSync(output400)) {
      await image
        .clone()
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(output400);
      
      const outputStats = fs.statSync(output400);
      const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
      console.log(`   ✅ Created: ${path.basename(output400)} (${outputSizeMB} MB)`);
    } else {
      console.log(`   ⏭️  Skipped: ${path.basename(output400)} (already exists)`);
    }

  } catch (error) {
    console.error(`   ❌ Error processing ${fileName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Optimizing shisha images...\n');

  for (const fileName of shishaImages) {
    await optimizeShishaImage(fileName);
  }

  console.log('\n✨ Shisha image optimization complete!');
}

main().catch(console.error);

