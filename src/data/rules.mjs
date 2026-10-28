export function isOrdered(actual, expected) {
  return actual.length === expected.length && actual.every((id, i) => id === expected[i]);
}
export function isMatched(actual, cards) {
  return Object.keys(actual).length === cards.length && cards.every(card => actual[card.id] === card.answer);
}
export function isFactSelection(actual, cards) {
  const expected = cards.filter(card => card.fact).map(card => card.id);
  return actual.length === expected.length && new Set(actual).size === expected.length && expected.every(id => actual.includes(id));
}
export function moveItem(items, from, to) {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
export function cleanSave(raw) {
  const initial = { chapter: 0, completed: [], started: false, presentation: false, sound: true, bgm: 0.3, sfx: 0.3, drafts: {}, ended: false };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return initial;
  const completed = Array.isArray(raw.completed) ? [...new Set(raw.completed.filter(x => Number.isInteger(x) && x >= 0 && x <= 5))] : [];
  let contiguous = 0;
  while (completed.includes(contiguous) && contiguous < 6) contiguous++;
  const safeCompleted = Array.from({ length: contiguous }, (_, i) => i);
  const chapter = Number.isInteger(raw.chapter) ? Math.max(0, Math.min(raw.chapter, Math.min(contiguous, 5))) : 0;
  const volume = value => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.3;
  const allowed = [
    ['piano','film','music','walk','friends','key','badge','redacted'],
    ['bangkok','three','korea','pangyo'], ['reuse','tannin','trial','limit'],
    ['birth','move','school','project','job','air','college'],
    ['degree','impulse','growth','hate','ecosystem','choice','hero','environment'],
    ['title','people','perfect'],
  ];
  const drafts = {};
  if (raw.drafts && typeof raw.drafts === 'object' && !Array.isArray(raw.drafts)) {
    for (let i=0; i<6; i++) {
      const draft = raw.drafts[String(i)];
      if (!draft || typeof draft !== 'object' || Array.isArray(draft)) continue;
      const cleaned = {};
      for (const key of ['order','selected']) {
        if (Array.isArray(draft[key])) cleaned[key] = [...new Set(draft[key].filter(id => typeof id === 'string' && allowed[i].includes(id)))];
      }
      if (draft.assignments && typeof draft.assignments === 'object' && !Array.isArray(draft.assignments)) {
        cleaned.assignments = Object.fromEntries(Object.entries(draft.assignments).filter(([id, answer]) => allowed[i].includes(id) && typeof answer === 'string'));
      }
      if (typeof draft.value === 'string' && allowed[i].includes(draft.value)) cleaned.value = draft.value;
      drafts[String(i)] = cleaned;
    }
  }
  return { ...initial, chapter, completed: safeCompleted, started: raw.started === true, presentation: raw.presentation === true,
    sound: typeof raw.sound === 'boolean' ? raw.sound : true, bgm: volume(raw.bgm), sfx: volume(raw.sfx),
    drafts, ended: raw.ended === true && contiguous === 6 };
}
