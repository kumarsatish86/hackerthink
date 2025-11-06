const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a simple favicon with "HT" text
function generateFavicon() {
  // Create a 32x32 canvas (standard favicon size)
  const size = 32;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Fill background with red color (matching the theme)
  ctx.fillStyle = '#DC2626'; // red-600
  ctx.fillRect(0, 0, size, size);

  // Set text properties
  ctx.fillStyle = '#FFFFFF'; // white text
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw "HT" text
  ctx.fillText('HT', size / 2, size / 2);

  // Convert to PNG buffer
  const buffer = canvas.toBuffer('image/png');

  // Save to public directory
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const faviconPath = path.join(publicDir, 'favicon.ico');
  
  // For .ico format, we'll save as PNG and rename (or use a library)
  // For simplicity, let's save as PNG and also create a .ico reference
  const pngPath = path.join(publicDir, 'favicon.png');
  fs.writeFileSync(pngPath, buffer);
  
  // Also copy to app directory for Next.js
  const appDir = path.join(__dirname, '..', 'src', 'app');
  const appFaviconPath = path.join(appDir, 'favicon.ico');
  
  // Copy PNG as favicon
  fs.copyFileSync(pngPath, appFaviconPath);
  
  console.log('✓ Favicon generated successfully!');
  console.log(`  - PNG: ${pngPath}`);
  console.log(`  - ICO: ${appFaviconPath}`);
}

try {
  generateFavicon();
} catch (error) {
  console.error('Error generating favicon:', error);
  console.error('\nNote: You may need to install canvas package:');
  console.error('  npm install canvas');
  process.exit(1);
}

