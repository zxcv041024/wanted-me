import available from './available-assets.json';
const base = import.meta.env.BASE_URL;
const optional = (path: string) => (available as string[]).includes(path) ? `${base}assets/${path}` : undefined;
export const assets = {
  scenes: `${base}assets/scenes.jpg`,
  portrait: optional('people/portrait-main.jpg'),
  couple: [optional('people/couple-1.jpg'), optional('people/couple-2.jpg')],
  memories: ['piano', 'friends', 'research', 'polestar'].map(name => optional(`memories/${name}.jpg`)),
  reference: ['board', 'airport', 'lab', 'airforce', 'devroom', 'boardcloseup', 'table'].map((name, i) => optional(`reference/scene-0${i + 1}-${name}.jpg`)),
  audio: { bgm: null, paper: null, acquired: null, closed: null },
};
