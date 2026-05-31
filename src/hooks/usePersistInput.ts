import { useState, useCallback } from 'react';

export function usePersistInput(toolId: string): [string, (val: string) => void, () => void] {
  const key = `testkit:input:${toolId}`;
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  });

  const setAndPersist = useCallback((val: string) => {
    setValue(val);
    try {
      localStorage.setItem(key, val);
    } catch {}
  }, [key]);

  const clear = useCallback(() => {
    setValue('');
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return [value, setAndPersist, clear];
}
