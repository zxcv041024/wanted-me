import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const paths = [
  'people/portrait-main.jpg', 'people/couple-1.jpg', 'people/couple-2.jpg',
  'memories/piano.jpg', 'memories/friends.jpg', 'memories/research.jpg', 'memories/polestar.jpg',
  'reference/scene-01-board.jpg', 'reference/scene-02-airport.jpg', 'reference/scene-03-lab.jpg',
  'reference/scene-04-airforce.jpg', 'reference/scene-05-devroom.jpg', 'reference/scene-06-boardcloseup.jpg', 'reference/scene-07-table.jpg',
];
const present = paths.filter(path => existsSync(resolve('public/assets', path)));
for (const dir of ['people', 'memories', 'reference', 'audio']) mkdirSync(resolve('public/assets', dir), { recursive: true });
mkdirSync(resolve('src/data'), { recursive: true });
writeFileSync(resolve('src/data/available-assets.json'), JSON.stringify(present, null, 2) + '\n');
console.log(`Optional personal assets: ${present.length}; cinematic fallback available.`);
