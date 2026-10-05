import { createContext, useContext, useState, type ReactNode } from 'react';

import { colors, type Colors, type Scheme } from './tokens';

type ThemeValue = {
  scheme: Scheme;
  colors: Colors;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>('light');

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
