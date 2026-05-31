import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
}

function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

const saved = (typeof localStorage !== 'undefined' ? localStorage.getItem('testkit:theme') : null) as ThemeMode | null;
const initialTheme = saved ?? 'light';
const initialResolved = resolveTheme(initialTheme);

if (typeof document !== 'undefined') {
  applyTheme(initialResolved);
}

export const useTheme = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,
  setTheme: (theme: ThemeMode) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem('testkit:theme', theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },
}));

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = useTheme.getState();
    if (current.theme === 'system') {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      useTheme.setState({ resolvedTheme: resolved });
    }
  });
}
