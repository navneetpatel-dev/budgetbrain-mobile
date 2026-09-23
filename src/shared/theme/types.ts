export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentPalette = 'indigo' | 'emerald' | 'ocean' | 'rose' | 'violet';

export interface ThemeColors {
  primary: string;
  primaryMuted: string;
  primarySoft: string;
  onPrimary: string;
  background: string;
  backgroundElevated: string;
  surfaceElevated: string;
  surface: string;
  surfaceContainer: string;
  surfaceDark: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceBright: string;
  primaryContainer: string;
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
  secondary: string;
  secondaryFixed: string;
  secondaryContainer: string;
  violet: string;
  rose: string;
  emerald: string;
  ocean: string;
  gradientStart: string;
  gradientEnd: string;
  tabBar: string;
  tabBarBorder: string;
  overlay: string;
  inputBg: string;
}

export interface ThemeTypography {
  display: { fontSize: number; fontWeight: '700' | '800'; letterSpacing: number; fontFamily?: string; lineHeight: number };
  title: { fontSize: number; fontWeight: '700'; letterSpacing: number; fontFamily?: string; lineHeight: number };
  titleSm: { fontSize: number; fontWeight: '600'; fontFamily?: string; lineHeight: number };
  body: { fontSize: number; fontWeight: '400'; fontFamily?: string; lineHeight: number };
  bodyMedium: { fontSize: number; fontWeight: '500'; fontFamily?: string; lineHeight: number };
  bodySemibold: { fontSize: number; fontWeight: '600'; fontFamily?: string; lineHeight: number };
  caption: { fontSize: number; fontWeight: '500'; fontFamily?: string; lineHeight: number };
  label: { fontSize: number; fontWeight: '600'; letterSpacing: number; textTransform: 'none' | 'uppercase'; fontFamily?: string; lineHeight: number };
  amount: { fontSize: number; fontWeight: '700'; letterSpacing: number; fontFamily?: string; fontVariant?: ('tabular-nums')[]; lineHeight: number };
  amountLg: { fontSize: number; fontWeight: '700' | '800'; letterSpacing: number; fontFamily?: string; fontVariant?: ('tabular-nums')[]; lineHeight: number };
}

/** Motion durations (ms) and spring config — shared "feel" spec with the web app's Framer Motion tokens. */
export interface ThemeMotionDurations {
  fast: number;
  base: number;
  slow: number;
}

export interface ThemeMotionSpring {
  damping: number;
  stiffness: number;
}

export interface ThemeMotion {
  duration: ThemeMotionDurations;
  spring: ThemeMotionSpring;
}

/** Named icon size scale, in px — passed to AppIcon's `size` prop alongside raw numbers. */
export interface ThemeIconSizes {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  /** Major section separation on scroll screens */
  section: number;
}

export interface ThemeRadii {
  sm: number;
  md: number;
  lg: number;
  card: number;
  xl: number;
  nav: number;
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
  motion: ThemeMotion;
  iconSizes: ThemeIconSizes;
  isDark: boolean;
}
