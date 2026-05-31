import { useCallback } from 'react';

const STORAGE_KEY = 'testkit:favorites';

export function useFavorites() {
  const getFavorites = useCallback((): string[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    const favorites = getFavorites();
    const index = favorites.indexOf(toolId);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.unshift(toolId);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
    return favorites;
  }, [getFavorites]);

  const isFavorite = useCallback((toolId: string): boolean => {
    return getFavorites().includes(toolId);
  }, [getFavorites]);

  return { getFavorites, toggleFavorite, isFavorite };
}
