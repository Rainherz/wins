import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { colors, type Colors, type Scheme } from './tokens';

type ThemeValue = {
  scheme: Scheme;
  colors: Colors;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>('light');

  // Keep the parts of the browser outside the React tree (overscroll, form controls) in the theme.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.style.backgroundColor = colors[scheme].bg;
    document.documentElement.style.colorScheme = scheme;
  }, [scheme]);

  const value: ThemeValue = {
    scheme,
    colors: colors[scheme],
    toggle: () => setScheme((current) => (current === 'light' ? 'dark' : 'light')),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
