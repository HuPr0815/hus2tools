import { useState, useEffect, useCallback, useRef } from 'react';

const MAX_SIZE = 4 * 1024 * 1024;

export function usePersistInput(toolId: string, defaultValue: string = '') {
  const key = `testkit:${toolId}:input`;
  const [value, setValue] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? saved : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        if (value.length > MAX_SIZE) return;
        localStorage.setItem(key, value);
      } catch {}
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, key]);

  const clearValue = useCallback(() => {
    setValue(defaultValue);
    try { localStorage.removeItem(key); } catch {}
  }, [key, defaultValue]);

  return [value, setValue, clearValue] as const;
}
