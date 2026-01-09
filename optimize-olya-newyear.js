#!/usr/bin/env node

/**
 * Image Optimization Script for Olya New Year images
 * Converts PNG images to WebP format and creates responsive versions
 * 
 * Requirements:
 * npm install sharp --save-dev
 * 
 * Usage:
 * node optimize-olya-newyear.js
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

const imagesDir = path.join(__dirname, 'assets/images/events/olya_newyear');

// Get all PNG files
const pngFiles = fs.readdirSync(imagesDir).filter(file => 
  file.toLowerCase().endsWith('.png')
);

if (pngFiles.length === 0) {
  console.log('❌ No PNG files found in olya_newyear directory');
  process.exit(1);
}

console.log(`📁 Found ${pngFiles.length} PNG files to convert\n`);

async function optimizeImage(pngFile) {
  const inputPath = path.join(imagesDir, pngFile);
  const baseName = path.basename(pngFile, '.PNG').replace(/ \(1\)/g, '');
  const outputBase = imagesDir;

  console.log(`\n🖼️  Processing: ${pngFile}`);

  // Sizes for event images (similar to event-2)
  const sizes = [
    { width: 1000, suffix: '' },
    { width: 750, suffix: '-750' },
    { width: 500, suffix: '-500' }
  ];

  // Create WebP versions
  for (const size of sizes) {
    const outputName = `${baseName}${size.suffix}.webp`;
    const outputPath = path.join(outputBase, outputName);

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
        .webp({ quality: 85 })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const originalStats = fs.statSync(inputPath);
      const savings = ((1 - stats.size / originalStats.size) * 100).toFixed(1);

      console.log(
        `   ✅ Created: ${outputName} (${(stats.size / 1024).toFixed(1)} KB, ${savings}% smaller)`
      );
    } catch (error) {
      console.error(`   ❌ Error processing ${size.width}px:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization for Olya New Year images...\n');

  for (const pngFile of pngFiles) {
    await optimizeImage(pngFile);
  }

  console.log('\n✨ Image optimization complete!');
  console.log('\n🗑️  Deleting original PNG files...');
  
  // Delete original PNG files
  for (const pngFile of pngFiles) {
    const pngPath = path.join(imagesDir, pngFile);
    try {
      fs.unlinkSync(pngPath);
      console.log(`   ✅ Deleted: ${pngFile}`);
    } catch (error) {
      console.error(`   ❌ Error deleting ${pngFile}:`, error.message);
    }
  }

  console.log('\n✅ All done! PNG files converted to WebP and originals deleted.');
}

main().catch(console.error);

