// Gera os ícones PNG (favicon, iOS, PWA) a partir do desenho em public/favicon.svg.
// Uso: node scripts/generate-icons.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const svg = await readFile(path.join(publicDir, 'favicon.svg'), 'utf8');

const render = (source, size) => sharp(Buffer.from(source), { density: 384 }).resize(size, size).png().toBuffer();

// Versão "maskable" (Android recorta em formas variadas): fundo sangrando até a borda e desenho
// reduzido para ficar dentro da zona segura central.
const maskable = svg
  .replace(' rx="116"', '')
  .replace('<g ', '<g transform="translate(256 256) scale(0.78) translate(-256 -256)" ');

const outputs = [
  ['favicon-32.png', svg, 32],
  ['apple-touch-icon.png', svg, 180],
  ['icon-192.png', svg, 192],
  ['icon-512.png', svg, 512],
  ['icon-maskable-512.png', maskable, 512],
];

for (const [name, source, size] of outputs) {
  await writeFile(path.join(publicDir, name), await render(source, size));
  console.log(`gerado ${name} (${size}x${size})`);
}
