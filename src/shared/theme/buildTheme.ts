import type {
  AppTheme,
  ThemeIconSizes,
  ThemeMotion,
  ThemeRadii,
  ThemeShadows,
  ThemeSpacing,
  ThemeTypography,
} from './types';
import { getThemeColors } from './palettes';
import type { AccentPalette, ThemeMode } from './types';

export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  section: 24,
};

export const radii: ThemeRadii = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 20,
  xl: 24,
  nav: 28,
  full: 999,
};

export const typography: ThemeTypography = {
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, fontFamily: 'Inter_800ExtraBold', lineHeight: 34 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, fontFamily: 'Inter_700Bold', lineHeight: 25 },
  titleSm: { fontSize: 17, fontWeight: '600', fontFamily: 'Inter_600SemiBold', lineHeight: 21 },
  body: { fontSize: 16, fontWeight: '400', fontFamily: 'Inter_400Regular', lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500', fontFamily: 'Inter_500Medium', lineHeight: 21 },
  bodySemibold: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '500', fontFamily: 'Inter_500Medium', lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2, textTransform: 'none', fontFamily: 'Inter_600SemiBold', lineHeight: 16 },
  amount: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'], lineHeight: 24 },
  amountLg: { fontSize: 32, fontWeight: '700', letterSpacing: -1, fontFamily: 'Fraunces_700Bold', fontVariant: ['tabular-nums'], lineHeight: 35 },
};

/** Motion durations (ms) + spring config — tuned to feel equivalent to the web app's Framer Motion tokens. */
export const motion: ThemeMotion = {
  duration: { fast: 120, base: 200, slow: 320 },
  spring: { damping: 18, stiffness: 220 },
};

/** Named icon size scale (px), passed to AppIcon's `size` prop alongside raw numbers. */
export const iconSizes: ThemeIconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

function getShadows(isDark: boolean, primary: string): ThemeShadows {
  if (isDark) {
    return {
      sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 2 },
      md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 4 },
      lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 8 },
    };
  }
  return {
    sm: { shadowColor: primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
    md: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
    lg: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 8 },
  };
}

export function buildTheme(
  resolvedMode: 'light' | 'dark',
  accent: AccentPalette,
  themeMode: ThemeMode
): AppTheme {
  const isDark = resolvedMode === 'dark';
  const colors = getThemeColors(resolvedMode, accent);
  return {
    mode: resolvedMode,
    accent,
    isDark,
    colors,
    typography,
    spacing,
    radii,
    shadows: getShadows(isDark, colors.primary),
    motion,
    iconSizes,
  };
}

export type { ThemeMode, AccentPalette };
