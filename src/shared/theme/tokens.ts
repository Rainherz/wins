export type Scheme = 'light' | 'dark';

export type Colors = {
  /** App background (paper). */
  bg: string;
  /** Second neutral layer for the sidebar and tab bar. */
  sidebar: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  /** Fills and icons. Never body text on a light background. */
  accent: string;
  /** Text and links on the page background. */
  accentStrong: string;
  accentSoft: string;
  /** Text and icons placed on top of `accent`. */
  onAccent: string;
  projects: readonly string[];
  mood: { good: string; soSo: string; tough: string };
  shadowCard: string;
  shadowRaised: string;
};

export const colors: Record<Scheme, Colors> = {
  light: {
    bg: '#F7F5F1',
    sidebar: '#F0ECE4',
    surface: '#FFFFFF',
    surfaceMuted: '#EFECE6',
    border: '#E6E1D8',
    text: '#1F1E1B',
    textMuted: '#6B665E',
    accent: '#EE8A3E',
    accentStrong: '#B9500F',
    accentSoft: '#FCEBDC',
    onAccent: '#1F1E1B',
    projects: ['#6F96BD', '#A084C4', '#7BA383', '#C99A5B', '#C47F8F'],
    mood: { good: '#4F8A63', soSo: '#8C7A3B', tough: '#9A6B66' },
    shadowCard: '0 1px 2px rgba(60, 40, 20, 0.05), 0 6px 20px rgba(60, 40, 20, 0.05)',
    shadowRaised: '0 2px 6px rgba(60, 40, 20, 0.08), 0 16px 40px rgba(60, 40, 20, 0.14)',
  },
  dark: {
    bg: '#171614',
    sidebar: '#1D1B18',
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
    shadowCard: '0 1px 2px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.25)',
    shadowRaised: '0 2px 6px rgba(0, 0, 0, 0.4), 0 16px 40px rgba(0, 0, 0, 0.5)',
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;

/** Breakpoint where navigation moves from a bottom bar to a sidebar. */
export const WIDE_BREAKPOINT = 1024;

export const fonts = {
  sans: 'DMSans_400Regular',
  serif: 'DMSerifDisplay_400Regular',
} as const;

/**
 * Role scale (about 1.2 between steps). Weights are resolved to the matching DM Sans
 * file by `@/shared/ui/Text`, so keep `fontWeight` here instead of a family name.
 */
export const type = {
  display: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 44, letterSpacing: -0.4 },
  hero: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 38, letterSpacing: -0.3 },
  title: { fontFamily: fonts.sans, fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: -0.2 },
  heading: { fontFamily: fonts.sans, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.2 },
} as const;
