#!/usr/bin/env node

/**
 * Convert Finka event JPGs (01.jpg … 20.jpg) to responsive WebP (1000 / 750 / 500).
 * Deletes originals after successful conversion.
 *
 * Usage: node optimize-finka.js
 */

const fs = require("fs");
const path = require("path");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("❌ Run: npm install sharp --save-dev");
  process.exit(1);
}

const imagesDir = path.join(__dirname, "assets/images/events/Finka");
const sizes = [
  { width: 1000, suffix: "" },
  { width: 750, suffix: "-750" },
  { width: 500, suffix: "-500" },
];

async function optimizeImage(imageFile) {
  const inputPath = path.join(imagesDir, imageFile);
  const baseName = path.basename(imageFile, path.extname(imageFile));

  console.log(`\n🖼️  ${imageFile}`);

  for (const size of sizes) {
    const outputPath = path.join(imagesDir, `${baseName}${size.suffix}.webp`);
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const height = Math.round((size.width / metadata.width) * metadata.height);

    await image
      .clone()
      .resize(size.width, height, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`   ✅ ${path.basename(outputPath)} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
}

async function main() {
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((f) => /^\d{2}\.(jpe?g)$/i.test(f))
    .sort();

  if (!imageFiles.length) {
    console.log("No numbered JPG files (01.jpg …) to convert.");
    return;
  }

  console.log(`📁 ${imageFiles.length} images in Finka\n`);

  const processed = [];
  for (const file of imageFiles) {
    try {
      await optimizeImage(file);
      processed.push(file);
    } catch (e) {
      console.error(`   ❌ ${file}:`, e.message);
    }
  }

  for (const file of processed) {
    fs.unlinkSync(path.join(imagesDir, file));
    console.log(`   🗑️  Deleted ${file}`);
  }

  const legacy = ["IMG_8456.webp", "IMG_8456.JPG.jpeg", "IMG_8456.JPG"];
  for (const name of legacy) {
    const p = path.join(imagesDir, name);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`   🗑️  Removed legacy ${name}`);
    }
  }

  console.log("\n✨ Done.");
}

main().catch(console.error);
