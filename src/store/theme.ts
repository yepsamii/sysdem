import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dataset.theme = theme;
}

/**
 * Resolve the initial theme from OS preference, falling back to dark.
 * Matches the reference site: `prefers-color-scheme: light` → light, otherwise dark.
 * Stored user choice (handled by `persist`) overrides this on subsequent loads.
 */
function detectInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  } catch {
    /* ignore */
  }
  return 'dark';
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: detectInitialTheme(),
      toggle: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
      set: (t: Theme) => {
        applyTheme(t);
        set({ theme: t });
      },
    }),
    {
      name: 'gravelgraph.theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);