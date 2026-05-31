import { create } from 'zustand';

const STORAGE_KEY = 'testkit:recent';
const MAX_RECENT = 20;

function loadRecent(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecent(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

interface RecentState {
  recent: string[];
  getRecent: () => string[];
  addRecent: (id: string) => void;
}

export const useRecentTools = create<RecentState>((set, get) => ({
  recent: loadRecent(),
  getRecent: () => get().recent,
  addRecent: (id: string) => {
    const current = get().recent;
    const filtered = current.filter(r => r !== id);
    const next = [id, ...filtered].slice(0, MAX_RECENT);
    saveRecent(next);
    set({ recent: next });
  },
}));
