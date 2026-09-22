'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ThemeMode } from '@/lib/theme';

const STORAGE_KEY = 'shc-theme';

export type ThemePreference = 'light' | 'dark' | 'auto';

type ThemeContextValue = {
  /** The resolved mode actually applied — what every colour-consuming component reads. */
  mode: ThemeMode;
  /** What the reader asked for. Settings' 3-way switch reads and writes this. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Quick flip for the top bar's icon button — always lands on an explicit light/dark. */
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'auto';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline script in app/[locale]/layout.tsx has already applied the
  // class before first paint; these start at the same defaults it falls back
  // to and correct themselves on mount, matching its logic exactly (see the
  // comment on that script).
  const [preference, setPreferenceState] = useState<ThemePreference>('auto');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private mode or blocked storage — falls through to 'auto'.
    }
    setPreferenceState(isPreference(stored) ? stored : 'auto');
    setSystemDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  // Tracks the OS setting live while the preference is 'auto'.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const mode: ThemeMode = preference === 'auto' ? (systemDark ? 'dark' : 'light') : preference;

  // Keeps the <html> class — and every Tailwind dark: rule — in sync with the
  // resolved mode, whichever of preference/systemDark changed.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Session-only if storage is unavailable — the switch still works.
    }
  }, []);

  const toggle = useCallback(() => {
    setPreference(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setPreference]);

  const value = useMemo(
    () => ({ mode, preference, setPreference, toggle }),
    [mode, preference, setPreference, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
