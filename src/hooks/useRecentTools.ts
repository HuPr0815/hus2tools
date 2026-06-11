import { create } from 'zustand';

const STORAGE_KEY = 'testkit:recent:v1';
const STATE_VERSION = 1;
const MAX_RECENT = 20;

function loadRecent(): string[] {
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
    const old = localStorage.getItem('testkit:recent');
    if (!old) return;
    const ids = JSON.parse(old);
    if (Array.isArray(ids)) {
      saveRecent(ids.slice(0, MAX_RECENT));
      localStorage.removeItem('testkit:recent');
    }
  } catch {}
}

function saveRecent(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STATE_VERSION, ids }));
  } catch {
    console.warn('[RecentTools] localStorage write failed, possibly full.');
  }
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
