#!/usr/bin/env node

/**
 * CSS Minifier Script
 * Minifies CSS to reduce file size
 */

const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'assets/css');
const inputFile = path.join(cssDir, 'combined.css');
const outputFile = path.join(cssDir, 'combined.min.css');

function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around specific characters
    .replace(/\s*([{}:;,])\s*/g, '$1')
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    // Remove whitespace at start/end
    .trim();
}

function minify() {
  console.log('🚀 Minifying CSS...\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    console.log('   Run combine-css.js first!');
    process.exit(1);
  }

  const css = fs.readFileSync(inputFile, 'utf8');
  const originalSize = Buffer.byteLength(css, 'utf8');
  
  const minified = minifyCSS(css);
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  
  fs.writeFileSync(outputFile, minified, 'utf8');
  
  console.log(`✅ Minification complete!`);
  console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
  console.log(`   Savings: ${savings}% (${((originalSize - minifiedSize) / 1024).toFixed(2)} KB)`);
  console.log(`   Output: ${path.relative(__dirname, outputFile)}`);
}

minify();

