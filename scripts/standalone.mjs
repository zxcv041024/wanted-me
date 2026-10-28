import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
let html = readFileSync('dist/index.html', 'utf8');
const scriptTag = /<script type="module" crossorigin src="([^"]+)"><\/script>/;
const styleTag = /<link rel="stylesheet" crossorigin href="([^"]+)">/;
if (!scriptTag.test(html) || !styleTag.test(html)) throw new Error('Expected Vite entry tags are missing.');
html = html.replace(scriptTag, (_, path) => {
  const code = readFileSync(resolve('dist', path.replace(/^\.\//,'')), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${code}</script>`;
});
html = html.replace(styleTag, (_, path) => `<style>${readFileSync(resolve('dist', path.replace(/^\.\//,'')), 'utf8')}</style>`);
writeFileSync('dist/PLAY.html', html);
console.log('Standalone: dist/PLAY.html (no backend, login, API key, or installation required).');
