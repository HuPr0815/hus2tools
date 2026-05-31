import { useCallback } from 'react';

const STORAGE_KEY = 'testkit:recent-tools';
const MAX_RECENT = 10;

export function useRecentTools() {
  const getRecent = useCallback((): string[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const addRecent = useCallback((toolId: string) => {
    try {
      const recent = getRecent().filter(id => id !== toolId);
      recent.unshift(toolId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
    } catch {}
  }, [getRecent]);

  return { getRecent, addRecent };
}
