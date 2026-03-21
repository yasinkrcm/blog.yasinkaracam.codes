#!/usr/bin/env node

/**
 * Favicon Generation Script
 *
 * This script generates multiple favicon formats from the SVG source.
 * Requires: sharp (npm install sharp)
 *
 * Usage: node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

// SVG template with different sizes
function generateSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0066FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0066FF;stop-opacity:0.5" />
    </linearGradient>
  </defs>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system" font-weight="bold" font-size="16"
        fill="url(#gradient)">
    YK
  </text>
</svg>`;
}

// Generate SVG files (these are the same, just for consistency)
const sizes = [
  { name: 'favicon.svg', size: 32 },
  { name: 'icon.svg', size: 512 },
];

sizes.forEach(({ name, size }) => {
  const svg = generateSVG(size);
  fs.writeFileSync(path.join(__dirname, name), svg);
  console.log(`✓ Generated ${name}`);
});

console.log('\n⚠ Note: For production deployment with nginx, you also need:');
console.log('  - favicon.ico (32x32)');
console.log('  - icon.png (512x512)');
console.log('  - favicon-16x16.png');
console.log('  - favicon-32x32.png');
console.log('  - apple-touch-icon.png (180x180)');
console.log('\nTo generate PNG/ICO files, use an online tool like:');
console.log('  - https://www.favicon-generator.org/');
console.log('  - https://realfavicongenerator.net/');
console.log('  - Or use ImageMagick: convert favicon.svg -define icon:auto-resize=256,64,48,32,16 favicon.ico');
