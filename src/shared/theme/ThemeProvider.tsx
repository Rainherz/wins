import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { colors, type Colors, type Scheme } from './tokens';

type ThemeValue = {
  scheme: Scheme;
  colors: Colors;
  toggle: () => void;
  /** False until the saved preference has been read, so the app never flashes the wrong theme. */
  ready: boolean;
};

const STORAGE_KEY = 'wins.theme';
const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && (saved === 'light' || saved === 'dark')) setScheme(saved);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the parts of the browser outside the React tree (overscroll, form controls) in the theme.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.style.backgroundColor = colors[scheme].bg;
    document.documentElement.style.colorScheme = scheme;
  }, [scheme]);

  const toggle = () => {
    const next: Scheme = scheme === 'light' ? 'dark' : 'light';
    setScheme(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  return <ThemeContext.Provider value={{ scheme, colors: colors[scheme], toggle, ready }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
