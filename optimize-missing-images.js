#!/usr/bin/env node

/**
 * Quick WebP conversion for missing images
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

const imagesToConvert = [
  {
    input: 'assets/images/about-us/about-abs-image.jpg',
    output: 'assets/images/about-us/about-abs-image.webp',
    sizes: [
      { width: 1140, suffix: '' },
      { width: 570, suffix: '-570' },
      { width: 285, suffix: '-285' }
    ]
  },
  {
    input: 'assets/images/sevice-1.jpg',
    output: 'assets/images/sevice-1.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ]
  },
  {
    input: 'assets/images/sevice-2.jpg',
    output: 'assets/images/sevice-2.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ]
  },
  {
    input: 'assets/images/sevice-3.jpg',
    output: 'assets/images/sevice-3.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ]
  },
  {
    input: 'assets/images/sevice-4.jpg',
    output: 'assets/images/sevice-4.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ]
  }
];

async function convertImage(config) {
  const inputPath = path.join(__dirname, config.input);
  const outputBase = path.join(__dirname, path.dirname(config.output));
  const outputName = path.basename(config.output, '.webp');

  if (!fs.existsSync(inputPath)) {
    console.warn(`⚠️  File not found: ${config.input}`);
    return;
  }

  console.log(`\n🖼️  Converting: ${config.input}`);

  for (const size of config.sizes) {
    const outputPath = path.join(outputBase, `${outputName}${size.suffix}.webp`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`   ⏭️  Skipped (exists): ${path.basename(outputPath)}`);
      continue;
    }

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      const height = Math.round((size.width / metadata.width) * metadata.height);

      await image
        .resize(size.width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`   ✅ Created: ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Converting images to WebP...\n');

  for (const config of imagesToConvert) {
    await convertImage(config);
  }

  console.log('\n✨ Conversion complete!');
}

main().catch(console.error);

