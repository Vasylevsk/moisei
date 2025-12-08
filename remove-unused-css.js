#!/usr/bin/env node

/**
 * Remove Unused CSS
 * Basic unused CSS removal based on HTML class usage
 */

const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, 'assets/css');
const inputFile = path.join(cssDir, 'combined.min.css');
const outputFile = path.join(cssDir, 'combined.min.css');

// Get all HTML files
const htmlFiles = [
  'index.html',
  'food-menu.html',
  'drink-menu.html',
  'hookah-menu.html',
  'reservation.html'
];

function extractClassesFromHTML() {
  const classes = new Set();
  
  htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract class attributes
      const classMatches = content.matchAll(/class=["']([^"']+)["']/g);
      for (const match of classMatches) {
        const classList = match[1].split(/\s+/);
        classList.forEach(cls => {
          if (cls.trim()) {
            classes.add(cls.trim());
          }
        });
      }
      
      // Extract IDs
      const idMatches = content.matchAll(/id=["']([^"']+)["']/g);
      for (const match of idMatches) {
        classes.add('#' + match[1]);
      }
      
      // Extract data attributes
      const dataMatches = content.matchAll(/data-([^=]+)=/g);
      for (const match of dataMatches) {
        classes.add('[data-' + match[1] + ']');
      }
    }
  });
  
  return classes;
}

function isSelectorUsed(selector, usedClasses) {
  // Remove pseudo-classes and pseudo-elements for matching
  const cleanSelector = selector
    .replace(/::?[a-z-]+(\([^)]*\))?/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .trim();
  
  // Check if any part of selector matches used classes
  const parts = cleanSelector.split(/[\s>+~,]/).map(p => p.trim()).filter(p => p);
  
  for (const part of parts) {
    // Remove . # and check
    const cleanPart = part.replace(/^[.#]/, '').split(':')[0];
    
    if (usedClasses.has(cleanPart) || 
        usedClasses.has('.' + cleanPart) ||
        usedClasses.has('#' + cleanPart) ||
        part.startsWith('*') ||
        part.startsWith('html') ||
        part.startsWith('body') ||
        part.startsWith('::') ||
        part.includes('@media') ||
        part.includes('@keyframes')) {
      return true;
    }
  }
  
  return false;
}

function removeUnusedCSS() {
  console.log('🚀 Removing unused CSS...\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }

  const css = fs.readFileSync(inputFile, 'utf8');
  const originalSize = Buffer.byteLength(css, 'utf8');
  
  console.log('📋 Extracting used classes from HTML...');
  const usedClasses = extractClassesFromHTML();
  console.log(`   Found ${usedClasses.size} unique classes/IDs\n`);

  // Split CSS into rules
  const rules = css.split('}').filter(r => r.trim());
  const keptRules = [];
  let removedCount = 0;

  console.log('🔍 Analyzing CSS rules...');
  
  for (const rule of rules) {
    const trimmed = rule.trim();
    if (!trimmed) continue;
    
    const selectorMatch = trimmed.match(/^([^{]+){/);
    if (!selectorMatch) {
      keptRules.push(trimmed);
      continue;
    }
    
    const selector = selectorMatch[1].trim();
    
    // Keep essential rules
    if (selector.includes('@media') ||
        selector.includes('@keyframes') ||
        selector.includes('@import') ||
        selector.includes(':root') ||
        selector.includes('*') ||
        selector.includes('html') ||
        selector.includes('body') ||
        selector.startsWith('::-') ||
        isSelectorUsed(selector, usedClasses)) {
      keptRules.push(trimmed);
    } else {
      removedCount++;
    }
  }

  const cleaned = keptRules.join('}') + (keptRules.length > 0 ? '}' : '');
  const cleanedSize = Buffer.byteLength(cleaned, 'utf8');
  
  const savings = ((1 - cleanedSize / originalSize) * 100).toFixed(1);
  const savingsKB = ((originalSize - cleanedSize) / 1024).toFixed(2);
  
  fs.writeFileSync(outputFile, cleaned, 'utf8');
  
  console.log(`\n✅ Unused CSS removal complete!`);
  console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`   Cleaned: ${(cleanedSize / 1024).toFixed(2)} KB`);
  console.log(`   Removed: ${removedCount} rules`);
  console.log(`   Savings: ${savings}% (${savingsKB} KB)`);
  
  if (parseFloat(savingsKB) >= 35) {
    console.log(`\n✨ Target achieved! Saved ${savingsKB} KB (target was 35 KB)`);
  }
}

removeUnusedCSS();

