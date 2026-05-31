import { create } from 'zustand';

const STORAGE_KEY = 'testkit:favorites';

function loadFavorites(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface FavoritesState {
  favorites: string[];
  getFavorites: () => string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  favorites: loadFavorites(),
  getFavorites: () => get().favorites,
  isFavorite: (id: string) => get().favorites.includes(id),
  toggleFavorite: (id: string) => {
    const current = get().favorites;
    const next = current.includes(id)
      ? current.filter(f => f !== id)
      : [...current, id];
    saveFavorites(next);
    set({ favorites: next });
  },
}));
