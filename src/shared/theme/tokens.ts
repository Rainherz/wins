export type Scheme = 'light' | 'dark';

export type Colors = {
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  onAccent: string;
  projects: readonly string[];
  mood: { good: string; soSo: string; tough: string };
};

export const colors: Record<Scheme, Colors> = {
  light: {
    bg: '#F7F5F1',
    surface: '#FFFFFF',
    surfaceMuted: '#EFECE6',
    border: '#E6E1D8',
    text: '#1F1E1B',
    textMuted: '#6B665E',
    accent: '#EE8A3E',
    accentStrong: '#B9500F',
    accentSoft: '#FDEBDD',
    onAccent: '#1F1E1B',
    projects: ['#6F96BD', '#A084C4', '#7BA383', '#C99A5B', '#C47F8F'],
    mood: { good: '#6E9B7E', soSo: '#A89560', tough: '#9A7A76' },
  },
  dark: {
    bg: '#171614',
    surface: '#211F1C',
    surfaceMuted: '#2A2723',
    border: '#37332E',
    text: '#F3EFE8',
    textMuted: '#A8A29A',
    accent: '#F29A57',
    accentStrong: '#F29A57',
    accentSoft: '#3A281B',
    onAccent: '#1F1E1B',
    projects: ['#86ABD0', '#B59BD4', '#92B99A', '#D8AE72', '#D597A5'],
    mood: { good: '#86B396', soSo: '#C1AE78', tough: '#B7938E' },
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 20, full: 999 } as const;

export const type = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: '500' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '500' },
  stat: { fontSize: 28, lineHeight: 32, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 1 },
} as const;
