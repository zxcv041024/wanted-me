export function isOrdered(actual: string[], expected: string[]): boolean;
export function isMatched(actual: Record<string, string>, cards: {id: string; answer: string}[]): boolean;
export function isFactSelection(actual: string[], cards: {id: string; fact: boolean}[]): boolean;
export function moveItem<T>(items: T[], from: number, to: number): T[];
export function cleanSave(raw: unknown): {
  chapter: number; completed: number[]; started: boolean; presentation: boolean; sound: boolean; bgm: number; sfx: number;
  drafts: Record<string, unknown>; ended: boolean;
};
