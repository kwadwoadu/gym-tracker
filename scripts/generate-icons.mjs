import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Design colors
const BACKGROUND = '#0A0A0A';
const ACCENT = '#CDFF00';

// SVG for dumbbell icon
const createDumbbellSvg = (size) => {
  const scale = size / 512;
  const strokeWidth = 24 * scale;
  const plateWidth = 60 * scale;
  const plateHeight = 180 * scale;
  const barHeight = 30 * scale;
  const plateRadius = 12 * scale;

  const centerX = size / 2;
  const centerY = size / 2;

  // Bar dimensions
  const barWidth = 280 * scale;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;

  // Plate positions (outer and inner on each side)
  const outerPlateOffset = 120 * scale;
  const innerPlateOffset = 70 * scale;

  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BACKGROUND}"/>

  <!-- Center bar -->
  <rect
    x="${barX}"
    y="${barY}"
    width="${barWidth}"
    height="${barHeight}"
    rx="${barHeight / 2}"
    fill="${ACCENT}"
  />

  <!-- Left outer plate -->
  <rect
    x="${centerX - outerPlateOffset - plateWidth / 2}"
    y="${centerY - plateHeight / 2}"
    width="${plateWidth}"
    height="${plateHeight}"
    rx="${plateRadius}"
    fill="${ACCENT}"
  />

  <!-- Left inner plate (smaller) -->
  <rect
    x="${centerX - innerPlateOffset - plateWidth / 2}"
    y="${centerY - plateHeight * 0.7 / 2}"
    width="${plateWidth}"
    height="${plateHeight * 0.7}"
    rx="${plateRadius}"
    fill="${ACCENT}"
  />

  <!-- Right inner plate (smaller) -->
  <rect
    x="${centerX + innerPlateOffset - plateWidth / 2}"
    y="${centerY - plateHeight * 0.7 / 2}"
    width="${plateWidth}"
    height="${plateHeight * 0.7}"
    rx="${plateRadius}"
    fill="${ACCENT}"
  />

  <!-- Right outer plate -->
  <rect
    x="${centerX + outerPlateOffset - plateWidth / 2}"
    y="${centerY - plateHeight / 2}"
    width="${plateWidth}"
    height="${plateHeight}"
    rx="${plateRadius}"
    fill="${ACCENT}"
  />
</svg>`;
};

// Create a simpler icon for smaller sizes (favicon)
const createSimpleSvg = (size) => {
  const padding = size * 0.15;
  const barHeight = size * 0.12;
  const plateWidth = size * 0.18;
  const plateHeight = size * 0.5;
  const plateRadius = size * 0.03;

  const centerX = size / 2;
  const centerY = size / 2;

  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BACKGROUND}"/>

  <!-- Simplified dumbbell -->
  <!-- Bar -->
  <rect
    x="${padding}"
    y="${centerY - barHeight / 2}"
    width="${size - padding * 2}"
    height="${barHeight}"
    rx="${barHeight / 2}"
    fill="${ACCENT}"
  />

  <!-- Left plate -->
  <rect
    x="${padding + plateWidth * 0.5}"
    y="${centerY - plateHeight / 2}"
    width="${plateWidth}"
    height="${plateHeight}"
    rx="${plateRadius}"
    fill="${ACCENT}"
  />

  <!-- Right plate -->
  <rect
    x="${size - padding - plateWidth * 1.5}"
    y="${centerY - plateHeight / 2}"
    width="${plateWidth}"
    height="${plateHeight}"
    rx="${plateRadius}"
    fill="${ACCENT}"
  />
</svg>`;
};

async function generateIcons() {
  // Ensure icons directory exists
  await mkdir(iconsDir, { recursive: true });

  console.log('Generating PWA icons...');

  // Generate 512x512 icon
  const svg512 = createDumbbellSvg(512);
  await sharp(Buffer.from(svg512))
    .png()
    .toFile(join(iconsDir, 'icon-512x512.png'));
  console.log('Created icon-512x512.png');

  // Generate 192x192 icon
  const svg192 = createDumbbellSvg(192);
  await sharp(Buffer.from(svg192))
    .png()
    .toFile(join(iconsDir, 'icon-192x192.png'));
  console.log('Created icon-192x192.png');

  // Generate favicon (32x32) using simpler design
  const svg32 = createSimpleSvg(32);
  await sharp(Buffer.from(svg32))
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  // Also generate apple-touch-icon (180x180)
  const svg180 = createDumbbellSvg(180);
  await sharp(Buffer.from(svg180))
    .png()
    .toFile(join(iconsDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Create favicon.ico from 32x32 PNG
  // Sharp doesn't support ICO directly, so we'll just use the PNG
  // and update the HTML to reference favicon.png

  console.log('\nAll icons generated successfully!');
  console.log('\nGenerated files:');
  console.log('- public/icons/icon-192x192.png');
  console.log('- public/icons/icon-512x512.png');
  console.log('- public/icons/apple-touch-icon.png');
  console.log('- public/favicon.png');
}

generateIcons().catch(console.error);
