const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const faviconDir = path.join(__dirname, 'favicon_io');
const sourceImage = path.join(faviconDir, 'Picture1.png');

// Generate all favicon sizes using sips
const sizes = [
  { size: 256, name: 'favicon-256x256.png' },
  { size: 128, name: 'favicon-128x128.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
  { size: 180, name: 'apple-touch-icon.png' }
];

console.log('Generating favicon sizes...');
sizes.forEach(({ size, name }) => {
  try {
    execSync(`sips -z ${size} ${size} "${sourceImage}" --out "${path.join(faviconDir, name)}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to create ${name}:`, e.message);
  }
});

// Create favicon.ico
try {
  execSync(`sips -z 128 128 "${sourceImage}" --out "${path.join(faviconDir, 'favicon.ico')}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to create favicon.ico:', e.message);
}

// Create base64 for SVG
try {
  const imageBuffer = fs.readFileSync(sourceImage);
  const base64 = imageBuffer.toString('base64');
  fs.writeFileSync(path.join(faviconDir, 'seo_base64.txt'), base64);
  
  // Create SVG favicon
  const svg = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image href="data:image/png;base64,${base64}" 
         x="0" 
         y="0" 
         width="256" 
         height="256" 
         preserveAspectRatio="xMidYMid meet"/>
</svg>`;
  fs.writeFileSync(path.join(__dirname, 'favicon_simple.svg'), svg);
  console.log('✅ SVG favicon created');
} catch (e) {
  console.error('Failed to create SVG:', e.message);
}

console.log('✅ All favicons generated!');

