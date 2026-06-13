export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentPalette = 'indigo' | 'emerald' | 'ocean' | 'rose' | 'violet';

export interface ThemeColors {
  primary: string;
  primaryMuted: string;
  primarySoft: string;
  onPrimary: string;
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  gradientStart: string;
  gradientEnd: string;
  tabBar: string;
  tabBarBorder: string;
  overlay: string;
  inputBg: string;
}

export interface ThemeTypography {
  display: { fontSize: number; fontWeight: '700' | '800'; letterSpacing: number; fontFamily?: string };
  title: { fontSize: number; fontWeight: '700'; letterSpacing: number; fontFamily?: string };
  titleSm: { fontSize: number; fontWeight: '600'; fontFamily?: string };
  body: { fontSize: number; fontWeight: '400'; fontFamily?: string };
  bodyMedium: { fontSize: number; fontWeight: '500'; fontFamily?: string };
  bodySemibold: { fontSize: number; fontWeight: '600'; fontFamily?: string };
  caption: { fontSize: number; fontWeight: '500'; fontFamily?: string };
  label: { fontSize: number; fontWeight: '600'; letterSpacing: number; textTransform: 'uppercase'; fontFamily?: string };
  amount: { fontSize: number; fontWeight: '700'; letterSpacing: number; fontFamily?: string };
  amountLg: { fontSize: number; fontWeight: '800'; letterSpacing: number; fontFamily?: string };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadii {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  sm: object;
  md: object;
  lg: object;
}

export interface AppTheme {
  mode: 'light' | 'dark';
  accent: AccentPalette;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  isDark: boolean;
}
