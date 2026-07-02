#!/usr/bin/env node

/**
 * Optimize menu images to WebP (100px + 200px thumbnails + full WebP).
 * High-res JPEG originals whose HTML uses short slugs (e.g. chicken-kyiv-100.webp)
 * are mapped here so outputs match food-menu.html.
 *
 * Usage:
 *   node optimize-menu-images.js
 *   node optimize-menu-images.js --force   # regenerate even if -100.webp exists
 *
 * Requires: npm install sharp --save-dev
 */

const fs = require("fs");
const path = require("path");

const force = process.argv.includes("--force");

let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("❌ Sharp is not installed. Please run: npm install sharp --save-dev");
  process.exit(1);
}

const menuDirs = [
  "assets/images/food-menu",
  "assets/images/drink-menu",
  "assets/images/hookah-menu",
];

/**
 * Map known menu photo originals → basename used in HTML (…-100.webp, …-200.webp).
 * Uses loose matching so odd Unicode quotes in filenames still match.
 */
/**
 * Default WebP basename (without "-100.webp") to match food-menu.html / drink paths.
 * - Most *.JPG → keep full name: borcht.JPG-100.webp
 * - *.jpg / *.jpeg / *.png (except .JPG) → strip one extension: Pelmeni.jpeg → Pelmeni
 * - *.JPG.jpeg exports → strip both: breadborsh.JPG.jpeg → breadborsh
 */
function defaultWebpStem(fileName) {
  const jpgThenJpeg = fileName.match(/^(.+)\.JPG\.jpe?g$/i);
  if (jpgThenJpeg) {
    return jpgThenJpeg[1];
  }
  const ext = path.extname(fileName);
  if (ext === ".JPG") {
    return fileName;
  }
  return path.basename(fileName, ext);
}

function menuSlugFromSource(fileName) {
  const n = fileName.trim();
  if (/^Homemade Pickled Herring\.JPG\.jpeg$/i.test(n)) return "pickled-herring";
  if (/Nadvirna/i.test(n) && /Canapes/i.test(n) && /\.jpe?g$/i.test(n)) return "nadvirna-canapes";
  if (/Chef/i.test(n) && /Sold Out/i.test(n) && /\.jpe?g$/i.test(n)) return "chef-salad-sold-out";
  if (/^Chicken Kyiv\.JPG\.jpeg$/i.test(n)) return "chicken-kyiv";
  if (/^Salmon with Asparagus\.JPG\.jpeg$/i.test(n)) return "salmon-asparagus";
  if (/Potato Pancakes with Goulash\.JPG\.jpeg$/i.test(n)) return "potato-pancakes-goulash";
  if (/Banosh with Bryndza/i.test(n) && /\.jpe?g$/i.test(n)) return "banosh-bryndza";
  if (/^Mixed Grill\.JPG\.jpeg$/i.test(n)) return "mixed-grill";
  if (/^Roast Beef Salad\.JPG\.jpeg$/i.test(n)) return "roast-beef-salad";
  if (/Beetroot/i.test(n) && /Feta/i.test(n) && /Salad/i.test(n) && /\.jpe?g$/i.test(n)) {
    return "beetroot-feta-salad";
  }
  if (/^Colifornia set/i.test(n) && /\.jpe?g$/i.test(n)) return "california-set";
  if (/^California salmon/i.test(n) && /\.jpe?g$/i.test(n)) return "california-smoked-salmon";
  if (/^California eel/i.test(n) && /\.jpe?g$/i.test(n)) return "california-eel";
  if (/^Crab burger/i.test(n) && /\.jpe?g$/i.test(n)) return "crab-burger";
  if (/^Eel burger/i.test(n) && /\.jpe?g$/i.test(n)) return "eel-burger";
  if (/^Beef steak/i.test(n) && /\.jpe?g$/i.test(n)) return "beef-steak";
  if (/^Maki set/i.test(n) && /\.jpe?g$/i.test(n)) return "maki-set";
  if (/^Maki with cucumber new/i.test(n) && /\.jpe?g$/i.test(n)) return "maki-cucumber";
  if (/^Maki with salmon new/i.test(n) && /\.jpe?g$/i.test(n)) return "maki-salmon";
  if (/^Maki with eel new/i.test(n) && /\.jpe?g$/i.test(n)) return "maki-eel";
  if (/^Maki with crab new/i.test(n) && /\.jpe?g$/i.test(n)) return "maki-crab";
  if (/^Maki with avocado new/i.test(n) && /\.jpe?g$/i.test(n)) return "maki-avocado";
  if (/^Beer platter new/i.test(n) && /\.jpe?g$/i.test(n)) return "beer-platter";
  if (/SpreadsThree in one/i.test(n) && /\.jpe?g$/i.test(n)) return "spreads-three-in-one";
  if (/Lyudka Apple Cake/i.test(n) && /\.jpe?g$/i.test(n)) return "lyudka-apple-cake";
  if (/Zurek soup|Z_urek soup/i.test(n) && /\.jpe?g$/i.test(n)) return "zurek-soup";
  if (/^Fruit platter/i.test(n) && /\.jpe?g$/i.test(n)) return "fruit-platter";
  if (/^Kiwi Spritz/i.test(n) && /\.jpe?g$/i.test(n)) return "kiwi-spritz";
  if (/^Strawberry Limoncello Spritz/i.test(n) && /\.jpe?g$/i.test(n)) return "strawberry-limoncello-spritz";
  if (/^Classic Mojito/i.test(n) && /\.jpe?g$/i.test(n)) return "classic-mojito";
  if (/^Margarita/i.test(n) && /\.jpe?g$/i.test(n)) return "margarita";
  if (/^LONG ISLAND ENERGY/i.test(n) && /\.jpe?g$/i.test(n)) return "long-island-energy";
  if (/^Cosmopolitan/i.test(n) && /\.jpe?g$/i.test(n)) return "cosmopolitan";
  if (/^Screwdriver/i.test(n) && /\.jpe?g$/i.test(n)) return "screwdriver";
  if (/^Orgasm/i.test(n) && /\.jpe?g$/i.test(n)) return "orgasm";
  return null;
}

function removeIfExists(p) {
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (_) {
    /* ignore */
  }
}

async function optimizeMenuImage(filePath) {
  const ext = path.extname(filePath);
  const extLower = ext.toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(extLower)) {
    return;
  }

  const dir = path.dirname(filePath);
  const sourceFileName = path.basename(filePath);
  const baseName = path.basename(filePath, ext);
  const slug = menuSlugFromSource(sourceFileName);
  const stem = slug || defaultWebpStem(sourceFileName);

  const outputBase = path.join(dir, `${stem}.webp`);
  const output200 = path.join(dir, `${stem}-200.webp`);
  const output100 = path.join(dir, `${stem}-100.webp`);

  const stripStem = baseName;

  if (!force && fs.existsSync(output100)) {
    return;
  }

  try {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`\n🖼️  Processing: ${sourceFileName} (${sizeMB} MB)`);
    if (slug) {
      console.log(`   → WebP slug: ${slug} (--force: ${force})`);
    }

    const image = sharp(filePath);

    await image
      .clone()
      .resize(200, 200, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 85 })
      .toFile(output200);

    const stats200 = fs.statSync(output200);
    console.log(`   ✅ Created 200px: ${path.basename(output200)} (${(stats200.size / 1024).toFixed(1)} KB)`);

    await image
      .clone()
      .resize(100, 100, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 85 })
      .toFile(output100);

    const stats100 = fs.statSync(output100);
    const savings = ((1 - stats100.size / stats.size) * 100).toFixed(1);
    console.log(
      `   ✅ Created 100px: ${path.basename(output100)} (${(stats100.size / 1024).toFixed(1)} KB, ${savings}% smaller)`
    );

    await image.clone().webp({ quality: 85 }).toFile(outputBase);

    const statsFull = fs.statSync(outputBase);
    console.log(`   ✅ Created full: ${path.basename(outputBase)} (${(statsFull.size / 1024 / 1024).toFixed(2)} MB)`);

    if (slug && slug !== baseName) {
      removeIfExists(path.join(dir, `${baseName}-100.webp`));
      removeIfExists(path.join(dir, `${baseName}-200.webp`));
      removeIfExists(path.join(dir, `${baseName}.webp`));
      console.log(`   🧹 Removed legacy names for: ${baseName}-*.webp`);
    }

    if (stem !== stripStem) {
      removeIfExists(path.join(dir, `${stripStem}-100.webp`));
      removeIfExists(path.join(dir, `${stripStem}-200.webp`));
      removeIfExists(path.join(dir, `${stripStem}.webp`));
      console.log(`   🧹 Removed wrong short stem: ${stripStem}-*.webp`);
    }
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
  const imageFiles = files.filter((file) => {
    const e = path.extname(file).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"].includes(e);
  });

  console.log(`\n📁 Processing directory: ${dirPath} (${imageFiles.length} images)`);

  for (const file of imageFiles) {
    const filePath = path.join(dirPath, file);
    await optimizeMenuImage(filePath);
  }
}

async function main() {
  console.log("🚀 Starting menu images optimization...\n");
  if (force) {
    console.log("⚡ --force: regenerating WebP even when -100.webp already exists.\n");
  }

  for (const dir of menuDirs) {
    await processDirectory(dir);
  }

  console.log("\n✨ Menu images optimization complete!");
  console.log("\n📝 Slug map lives in optimize-menu-images.js (menuSlugFromSource).");
  console.log("   Run with --force after replacing a JPEG original.");
}

main().catch(console.error);
