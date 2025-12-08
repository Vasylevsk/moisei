#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// HTML files to update
const htmlFiles = [
  'index.html',
  'reservation.html',
  'food-menu.html',
  'drink-menu.html',
  'hookah-menu.html'
];

// Generate new version based on timestamp
const version = Date.now();

console.log(`🔄 Updating CSS version to: ${version}`);

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace version in CSS link
  const oldPattern = /combined\.min\.css\?v=\d+(\.\d+)?/g;
  const newLink = `combined.min.css?v=${version}`;
  
  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newLink);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
  } else {
    // If no version found, add it
    content = content.replace(
      /combined\.min\.css/g,
      newLink
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added version to: ${file}`);
  }
});

console.log(`\n✨ CSS version updated to: ${version}`);
console.log(`📝 Commit and push to update the site!`);

