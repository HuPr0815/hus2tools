import { useState, useCallback } from 'react';

const MAX_INPUT_LENGTH = 100_000;

export function usePersistInput(toolId: string): [string, (val: string) => void, () => void] {
  const key = `testkit:input:${toolId}:v1`;
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return '';
      const data = JSON.parse(raw);
      return (data.v === 1 && typeof data.text === 'string') ? data.text : '';
    } catch {
      return '';
    }
  });

  const setAndPersist = useCallback((val: string) => {
    setValue(val);
    try {
      const trimmed = val.length > MAX_INPUT_LENGTH ? val.slice(0, MAX_INPUT_LENGTH) : val;
      localStorage.setItem(key, JSON.stringify({ v: 1, text: trimmed }));
    } catch {
      console.warn(`[PersistInput] Failed to save input for "${toolId}", localStorage may be full.`);
    }
  }, [key, toolId]);

  const clear = useCallback(() => {
    setValue('');
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return [value, setAndPersist, clear];
}
