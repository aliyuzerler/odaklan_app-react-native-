/**
 * assets/images altındaki tüm ikon ve splash görsellerini üretir.
 * Kullanım: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets', 'images');
mkdirSync(outDir, { recursive: true });

// Hedef işareti: emerald halka + iç dolgu + merkez nokta
const mark = (size, strokeW, innerR, dotR, color = '#10B981') => `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size / 2}" cy="${size / 2}" r="${(size - strokeW) / 2}"
      fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"
      stroke-dasharray="${size * 0.7} ${size}" stroke-dashoffset="-${size * 0.08}"
      transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${innerR}" fill="${color}" opacity="0.18"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${dotR}" fill="${color}"/>
  </svg>`;

// Tam kare koyu zeminli icon (iOS + web)
const fullIcon = (size) => `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#101013"/>
        <stop offset="1" stop-color="#09090B"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
    ${mark(size, size * 0.055, size * 0.27, size * 0.11, '#10B981')}
  </svg>`;

// Android adaptive foreground: işaret %66 güvenli alanda, şeffaf zemin
const adaptiveForeground = (size) => `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    ${mark(size * 0.62, size * 0.62 * 0.06, size * 0.62 * 0.3, size * 0.62 * 0.12)
      .replace(/cx="([^"]*)"/g, (m, v) => `cx="${size / 2}"`)
      .replace(/cy="([^"]*)"/g, (m, v) => `cy="${size / 2}"`)
      .replace(/r="([^"]*)"/g, (m, i) => m)}
  </svg>`;

// Daha güvenli adaptive foreground: işareti merkeze absolute konumlandır
const adaptiveFg2 = (size) => {
  const s = size * 0.6;
  const off = (size - s) / 2;
  return `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${off} ${off})">
      <circle cx="${s / 2}" cy="${s / 2}" r="${(s - s * 0.07) / 2}"
        fill="none" stroke="#10B981" stroke-width="${s * 0.07}" stroke-linecap="round"
        stroke-dasharray="${s * 0.72} ${s}" stroke-dashoffset="-${s * 0.09}"
        transform="rotate(-90 ${s / 2} ${s / 2})"/>
      <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.3}" fill="#10B981" opacity="0.18"/>
      <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.12}" fill="#10B981"/>
    </g>
  </svg>`;
};

const mono = (size) => `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${size * 0.2} ${size * 0.2})">
      ${(() => {
        const s = size * 0.6;
        return `
        <circle cx="${s / 2}" cy="${s / 2}" r="${(s - s * 0.07) / 2}"
          fill="none" stroke="#000000" stroke-width="${s * 0.07}" stroke-linecap="round"
          stroke-dasharray="${s * 0.72} ${s}" stroke-dashoffset="-${s * 0.09}"
          transform="rotate(-90 ${s / 2} ${s / 2})"/>
        <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.12}" fill="#000000"/>`;
      })()}
    </g>
  </svg>`;

const jobs = [
  ['icon.png', fullIcon(1024), 1024],
  ['favicon.png', fullIcon(128), 128],
  ['adaptive-icon.png', adaptiveFg2(1024), 1024],
  ['adaptive-icon-mono.png', mono(1024), 1024],
  ['splash-icon.png', mark(600, 600 * 0.05, 600 * 0.28, 600 * 0.115), 600],
];

for (const [name, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(outDir, name));
  console.log('✓', name);
}

// Android adaptive icon arka planı — düz koyu
await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 9, g: 9, b: 11, alpha: 1 } },
})
  .png()
  .toFile(join(outDir, 'adaptive-icon-bg.png'));
console.log('✓ adaptive-icon-bg.png');
