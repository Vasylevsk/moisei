#!/usr/bin/env node

/**
 * Update menu HTML files to use WebP images
 */

const fs = require('fs');
const path = require('path');

const menuFiles = [
  'food-menu.html',
  'drink-menu.html',
  'hookah-menu.html'
];

function findWebPFile(menuDir, baseName) {
  const dir = path.join('assets/images', menuDir);
  if (!fs.existsSync(dir)) return null;

  // Try different variations of the filename
  const variations = [
    `${baseName}-100.webp`,
    `${baseName.replace(/ /g, ' ')}-100.webp`,
    `${baseName.replace(/\./g, '.')}-100.webp`,
    `${baseName.replace(/\./g, ' ')}-100.webp`
  ];

  const files = fs.readdirSync(dir);
  
  // Try exact match first
  for (const variation of variations) {
    if (files.includes(variation)) {
      return variation;
    }
  }

  // Try case-insensitive match
  const lowerBase = baseName.toLowerCase();
  for (const file of files) {
    if (file.toLowerCase().includes(lowerBase) && file.includes('-100.webp')) {
      return file;
    }
  }

  return null;
}

function updateImageTags(html) {
  // Pattern to match img tags with food-menu, drink-menu, or hookah-menu images
  const imgPattern = /(<img[^>]+src="\.\/assets\/images\/(food-menu|drink-menu|hookah-menu)\/([^"]+)"[^>]*>)/g;
  
  return html.replace(imgPattern, (match, fullTag, menuDir, imageName) => {
    // Skip if already WebP or placeholder images
    if (imageName.includes('.webp') || imageName.includes('menu-1.png') || imageName.includes('menu-2.jpg')) {
      return match;
    }

    // Get base name without extension
    const baseName = imageName.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '');
    
    // Find WebP file
    const webpFile = findWebPFile(menuDir, baseName);
    
    if (!webpFile) {
      // Try to find any WebP file with similar name
      const dir = path.join('assets/images', menuDir);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const matching = files.find(f => 
          f.includes(baseName.split(' ')[0]) && f.includes('-100.webp')
        );
        if (matching) {
          const altMatch = fullTag.match(/alt="([^"]*)"/);
          const alt = altMatch ? altMatch[1] : '';
          const base200 = matching.replace('-100.webp', '-200.webp');
          
          return `<picture>
                      <source 
                        type="image/webp" 
                        srcset="./assets/images/${menuDir}/${base200} 200w, ./assets/images/${menuDir}/${matching} 100w"
                        sizes="100px">
                      <img 
                        src="./assets/images/${menuDir}/${matching}" 
                        width="100" 
                        height="100" 
                        loading="lazy" 
                        alt="${alt}" 
                        class="img-cover"
                        decoding="async"
                        onerror="this.onerror=null; this.src='./assets/images/${menuDir}/${imageName}';">
                    </picture>`;
        }
      }
      return match;
    }

    const base200 = webpFile.replace('-100.webp', '-200.webp');
    const altMatch = fullTag.match(/alt="([^"]*)"/);
    const alt = altMatch ? altMatch[1] : '';

    // Replace with picture element
    const pictureTag = `<picture>
                      <source 
                        type="image/webp" 
                        srcset="./assets/images/${menuDir}/${base200} 200w, ./assets/images/${menuDir}/${webpFile} 100w"
                        sizes="100px">
                      <img 
                        src="./assets/images/${menuDir}/${webpFile}" 
                        width="100" 
                        height="100" 
                        loading="lazy" 
                        alt="${alt}" 
                        class="img-cover"
                        decoding="async"
                        onerror="this.onerror=null; this.src='./assets/images/${menuDir}/${imageName}';">
                    </picture>`;

    return pictureTag;
  });
}

async function updateMenuFile(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const updated = updateImageTags(content);
  
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`   ✅ Updated: ${filePath}`);
  } else {
    console.log(`   ⏭️  No changes needed: ${filePath}`);
  }
}

async function main() {
  console.log('🚀 Updating menu HTML files to use WebP images...\n');

  for (const file of menuFiles) {
    await updateMenuFile(file);
  }

  console.log('\n✨ Menu HTML files updated!');
}

main().catch(console.error);

