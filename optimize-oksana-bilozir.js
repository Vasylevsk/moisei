#!/usr/bin/env node

/**
 * Image Optimization Script for Oksana Bilozir event images
 * Converts JPG images to WebP format and creates responsive versions
 * Deletes original JPG files after conversion
 * 
 * Requirements:
 * npm install sharp --save-dev
 * 
 * Usage:
 * node optimize-oksana-bilozir.js
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

const imagesDir = path.join(__dirname, 'assets/images/events/OksanaBilozir');

if (!fs.existsSync(imagesDir)) {
  console.error(`❌ Directory not found: ${imagesDir}`);
  process.exit(1);
}

// Get all JPG/JPG files
const imageFiles = fs.readdirSync(imagesDir).filter(file => 
  /\.(jpg|jpeg|JPG|JPEG)$/i.test(file)
);

if (imageFiles.length === 0) {
  console.log('❌ No JPG files found in OksanaBilozir directory');
  process.exit(1);
}

console.log(`📁 Found ${imageFiles.length} JPG files to convert\n`);

async function optimizeImage(imageFile) {
  const inputPath = path.join(imagesDir, imageFile);
  const baseName = path.basename(imageFile, path.extname(imageFile));
  const outputBase = imagesDir;

  console.log(`\n🖼️  Processing: ${imageFile}`);

  // Sizes for event images
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
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Starting image optimization for Oksana Bilozir images...\n');

  const processedFiles = [];

  // Process all images first
  for (const imageFile of imageFiles) {
    try {
      await optimizeImage(imageFile);
      processedFiles.push(imageFile);
    } catch (error) {
      console.error(`❌ Failed to process ${imageFile}:`, error.message);
    }
  }

  console.log('\n✨ Image optimization complete!');
  
  if (processedFiles.length === 0) {
    console.log('❌ No files were successfully processed. Skipping deletion.');
    return;
  }

  console.log('\n🗑️  Deleting original JPG files...');
  
  // Delete original JPG files only after successful conversion
  for (const imageFile of processedFiles) {
    const imagePath = path.join(imagesDir, imageFile);
    try {
      fs.unlinkSync(imagePath);
      console.log(`   ✅ Deleted: ${imageFile}`);
    } catch (error) {
      console.error(`   ❌ Error deleting ${imageFile}:`, error.message);
    }
  }

  console.log(`\n✅ All done! ${processedFiles.length} JPG files converted to WebP and originals deleted.`);
}

main().catch(console.error);

