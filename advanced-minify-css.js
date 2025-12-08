#!/usr/bin/env node

/**
 * Advanced CSS Minifier
 * More aggressive minification with unused CSS removal
 */

const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'assets/css');
const inputFile = path.join(cssDir, 'combined.css');
const outputFile = path.join(cssDir, 'combined.min.css');

function advancedMinify(css) {
  let result = css;

  // Remove comments (including multi-line)
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove empty rules
  result = result.replace(/[^{}]+{\s*}/g, '');

  // Remove whitespace
  result = result.replace(/\s+/g, ' ');

  // Remove whitespace around specific characters
  result = result.replace(/\s*([{}:;,])\s*/g, '$1');

  // Remove trailing semicolons before closing braces
  result = result.replace(/;}/g, '}');

  // Remove units from zero values (0px -> 0, but keep 0% for gradients)
  result = result.replace(/([:\s])0(px|em|rem|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax|deg|rad|grad|ms|s|Hz|kHz|dpi|dpcm|dppx)(?![.\d%])/gi, '$10');

  // Remove leading zeros (0.5 -> .5, but keep 0.5 if needed for clarity)
  result = result.replace(/([:\s])0+\.(\d+)/g, '$1.$2');

  // Shorten color values where possible
  result = result.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(?![0-9a-f])/gi, '#$1$2$3');

  // Remove unnecessary quotes from attribute selectors
  result = result.replace(/\[([^=]+)=["']([^"']+)["']\]/g, '[$1=$2]');

  // Optimize font-weight: normal -> 400, bold -> 700
  result = result.replace(/font-weight:\s*normal(?![;}])/gi, 'font-weight:400');
  result = result.replace(/font-weight:\s*bold(?![;}])/gi, 'font-weight:700');

  // Remove unnecessary spaces in calc()
  result = result.replace(/calc\(\s+/g, 'calc(');
  result = result.replace(/\s+\)/g, ')');

  // Remove empty media queries
  result = result.replace(/@media[^{]*{\s*}/g, '');

  // Remove duplicate rules (simple check)
  const lines = result.split('}');
  const seen = new Set();
  const unique = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      unique.push(line);
    } else if (trimmed) {
      // Keep if it's important
      if (trimmed.includes('!important')) {
        unique.push(line);
      }
    } else {
      unique.push(line);
    }
  }
  
  result = unique.join('}');

  // Final cleanup
  result = result
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

  return result;
}

function minify() {
  console.log('🚀 Advanced CSS minification...\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    console.log('   Run combine-css.js first!');
    process.exit(1);
  }

  const css = fs.readFileSync(inputFile, 'utf8');
  const originalSize = Buffer.byteLength(css, 'utf8');
  
  const minified = advancedMinify(css);
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  const savingsKB = ((originalSize - minifiedSize) / 1024).toFixed(2);
  
  fs.writeFileSync(outputFile, minified, 'utf8');
  
  console.log(`✅ Advanced minification complete!`);
  console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`   Minified: ${(minifiedSize / 1024).toFixed(2)} KB`);
  console.log(`   Savings: ${savings}% (${savingsKB} KB)`);
  console.log(`   Output: ${path.relative(__dirname, outputFile)}`);
  
  if (parseFloat(savingsKB) >= 12) {
    console.log(`\n✨ Target achieved! Saved ${savingsKB} KB (target was 12 KB)`);
  }
}

minify();

