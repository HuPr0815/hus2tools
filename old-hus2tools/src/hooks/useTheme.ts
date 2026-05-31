import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(resolved);
}

export const useTheme = create<ThemeState>((set) => {
  const saved = localStorage.getItem('testkit:theme') as Theme | null;
  const initial = saved || 'system';
  const resolved = resolveTheme(initial);
  applyTheme(resolved);

  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const state = useTheme.getState();
      if (state.theme === 'system') {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    });
  }

  return {
    theme: initial,
    resolvedTheme: resolved,
    setTheme: (theme: Theme) => {
      const resolved = resolveTheme(theme);
      applyTheme(resolved);
      localStorage.setItem('testkit:theme', theme);
      set({ theme, resolvedTheme: resolved });
    },
  };
});
