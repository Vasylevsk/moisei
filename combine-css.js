#!/usr/bin/env node

/**
 * CSS Combiner Script
 * Combines all CSS files into one file to reduce blocking requests
 */

const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'assets/css');
const outputFile = path.join(cssDir, 'combined.css');

// Order of CSS files (important for cascade)
const cssFiles = [
  'variables.css',
  'reset.css',
  'typography.css',
  'utilities.css',
  'components.css',
  'layout.css',
  'sections.css',
  'responsive.css'
];

function combineCSS() {
  console.log('🚀 Combining CSS files...\n');
  
  let combinedCSS = '';
  let totalSize = 0;

  for (const file of cssFiles) {
    const filePath = path.join(cssDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const size = Buffer.byteLength(content, 'utf8');
    totalSize += size;

    // Add file comment
    combinedCSS += `\n/* ========================================\n`;
    combinedCSS += `   ${file}\n`;
    combinedCSS += `   ======================================== */\n\n`;
    
    // Remove @import statements if any
    const cleanedContent = content.replace(/@import\s+url\([^)]+\)\s*;?/gi, '');
    
    combinedCSS += cleanedContent;
    combinedCSS += '\n\n';

    console.log(`✅ Added: ${file} (${(size / 1024).toFixed(2)} KB)`);
  }

  // Write combined file
  fs.writeFileSync(outputFile, combinedCSS, 'utf8');
  
  const outputSize = Buffer.byteLength(combinedCSS, 'utf8');
  const savings = ((1 - outputSize / totalSize) * 100).toFixed(1);

  console.log(`\n✨ CSS combination complete!`);
  console.log(`   Total size: ${(outputSize / 1024).toFixed(2)} KB`);
  console.log(`   Output file: ${path.relative(__dirname, outputFile)}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Update HTML to use combined.css instead of main.css`);
  console.log(`   2. Add <link rel="preload"> for faster loading`);
}

combineCSS();

