import { create } from 'zustand';

const STORAGE_KEY = 'testkit:favorites:v1';
const STATE_VERSION = 1;

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      migrateFromOldKey();
      return [];
    }
    const data = JSON.parse(raw);
    if (data.v !== STATE_VERSION) return [];
    return Array.isArray(data.ids) ? data.ids : [];
  } catch {
    return [];
  }
}

function migrateFromOldKey() {
  try {
    const old = localStorage.getItem('testkit:favorites');
    if (!old) return;
    const ids = JSON.parse(old);
    if (Array.isArray(ids)) {
      saveFavorites(ids);
      localStorage.removeItem('testkit:favorites');
    }
  } catch {}
}

function saveFavorites(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STATE_VERSION, ids }));
  } catch {
    console.warn('[Favorites] localStorage write failed, possibly full.');
  }
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
