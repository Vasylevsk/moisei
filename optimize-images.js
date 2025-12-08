#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts images to WebP format and creates responsive versions
 * 
 * Requirements:
 * npm install sharp --save-dev
 * 
 * Usage:
 * node optimize-images.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp is not installed. Please run: npm install sharp --save-dev');
  process.exit(1);
}

const imagesToOptimize = [
  {
    input: 'assets/images/hero-slider-1.JPG',
    output: 'assets/images/hero-slider-1.webp',
    outputJpg: 'assets/images/hero-slider-1.jpg',
    sizes: [
      { width: 1920, suffix: '' },
      { width: 1280, suffix: '-1280' },
      { width: 960, suffix: '-960' },
      { width: 640, suffix: '-640' }
    ],
    quality: 85,
    jpgQuality: 80
  },
  {
    input: 'assets/images/hero-slider-2.jpg',
    output: 'assets/images/hero-slider-2.webp',
    outputJpg: 'assets/images/hero-slider-2-optimized.jpg',
    sizes: [
      { width: 1920, suffix: '' },
      { width: 1280, suffix: '-1280' },
      { width: 960, suffix: '-960' },
      { width: 640, suffix: '-640' }
    ],
    quality: 85,
    jpgQuality: 80
  },
  {
    input: 'assets/images/hero-slider-3.jpg',
    output: 'assets/images/hero-slider-3.webp',
    outputJpg: 'assets/images/hero-slider-3-optimized.jpg',
    sizes: [
      { width: 1920, suffix: '' },
      { width: 1280, suffix: '-1280' },
      { width: 960, suffix: '-960' },
      { width: 640, suffix: '-640' }
    ],
    quality: 85,
    jpgQuality: 80
  },
  {
    input: 'assets/images/event-2.PNG',
    output: 'assets/images/event-2.webp',
    sizes: [
      { width: 1000, suffix: '' },
      { width: 750, suffix: '-750' },
      { width: 500, suffix: '-500' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/menu/1.png',
    output: 'assets/images/menu/1.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/menu/2.png',
    output: 'assets/images/menu/2.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/menu/3.png',
    output: 'assets/images/menu/3.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/special-dish-banner.png',
    output: 'assets/images/special-dish-banner.webp',
    sizes: [
      { width: 1880, suffix: '' },
      { width: 940, suffix: '-940' },
      { width: 640, suffix: '-640' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/about-us/about-abs-image.jpg',
    output: 'assets/images/about-us/about-abs-image.webp',
    outputJpg: 'assets/images/about-us/about-abs-image-optimized.jpg',
    sizes: [
      { width: 1140, suffix: '' },
      { width: 570, suffix: '-570' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85,
    jpgQuality: 80
  },
  {
    input: 'assets/images/sevice-1.jpg',
    output: 'assets/images/sevice-1.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/sevice-2.jpg',
    output: 'assets/images/sevice-2.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/sevice-3.jpg',
    output: 'assets/images/sevice-3.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  },
  {
    input: 'assets/images/sevice-4.jpg',
    output: 'assets/images/sevice-4.webp',
    sizes: [
      { width: 570, suffix: '' },
      { width: 285, suffix: '-285' }
    ],
    quality: 85
  }
];

async function optimizeImage(config) {
  const inputPath = path.join(__dirname, config.input);
  const outputBase = path.join(__dirname, path.dirname(config.output));
  const outputName = path.basename(config.output, '.webp');

  if (!fs.existsSync(inputPath)) {
    console.warn(`⚠️  File not found: ${config.input}`);
    return;
  }

  console.log(`\n🖼️  Processing: ${config.input}`);

  // Create optimized JPG fallback if specified
  if (config.outputJpg) {
    const jpgOutputPath = path.join(__dirname, config.outputJpg);
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Use the largest size for JPG fallback
      const largestSize = config.sizes[0];
      const height = Math.round(
        (largestSize.width / metadata.width) * metadata.height
      );

      await image
        .resize(largestSize.width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: config.jpgQuality || 80, mozjpeg: true })
        .toFile(jpgOutputPath);

      const stats = fs.statSync(jpgOutputPath);
      const originalStats = fs.statSync(inputPath);
      const savings = ((1 - stats.size / originalStats.size) * 100).toFixed(1);

      console.log(
        `   ✅ Created optimized JPG: ${path.basename(jpgOutputPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB, ${savings}% smaller)`
      );
    } catch (error) {
      console.error(`   ❌ Error creating JPG fallback:`, error.message);
    }
  }

  // Create WebP versions
  for (const size of config.sizes) {
    const outputPath = path.join(
      outputBase,
      `${outputName}${size.suffix}.webp`
    );

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Calculate height to maintain aspect ratio
      const height = Math.round(
        (size.width / metadata.width) * metadata.height
      );

      await image
        .resize(size.width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: config.quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const originalStats = fs.statSync(inputPath);
      const savings = ((1 - stats.size / originalStats.size) * 100).toFixed(1);

      console.log(
        `   ✅ Created: ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(1)} KB, ${savings}% smaller)`
      );
    } catch (error) {
      console.error(`   ❌ Error processing ${size.width}px:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');

  for (const config of imagesToOptimize) {
    await optimizeImage(config);
  }

  console.log('\n✨ Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the generated WebP files');
  console.log('   2. Update HTML files to use <picture> elements with WebP');
  console.log('   3. Test the website to ensure images load correctly');
}

main().catch(console.error);

