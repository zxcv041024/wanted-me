import { useEffect, useState } from 'react';
import { cleanSave } from '../data/rules.mjs';
export const SAVE_KEY = 'wanted-me-case001-v1';
export type CaseState = ReturnType<typeof cleanSave>;
export function useCase() {
  const [state, setState] = useState<CaseState>(() => {
    try { return cleanSave(JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')); } catch { return cleanSave(null); }
  });
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); setSaveError(false); } catch { setSaveError(true); }
  }, [state]);
  return { state, setState, saveError };
}
