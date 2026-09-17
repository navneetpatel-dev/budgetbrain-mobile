import type { AccentPalette, ThemeColors, ThemeMode } from './types';

const ACCENT_PRIMARIES: Record<AccentPalette, { primary: string; gradientEnd: string }> = {
  indigo: { primary: '#6366F1', gradientEnd: '#8B5CF6' },
  emerald: { primary: '#10B981', gradientEnd: '#059669' },
  ocean: { primary: '#0EA5E9', gradientEnd: '#0284C7' },
  rose: { primary: '#F43F5E', gradientEnd: '#E11D48' },
  violet: { primary: '#8B5CF6', gradientEnd: '#7C3AED' },
};

const VALID_ACCENTS = new Set<string>(Object.keys(ACCENT_PRIMARIES));
export const DEFAULT_ACCENT: AccentPalette = 'ocean';

export function resolveAccent(accent: unknown): AccentPalette {
  return typeof accent === 'string' && VALID_ACCENTS.has(accent) ? (accent as AccentPalette) : DEFAULT_ACCENT;
}

export function resolveThemeMode(mode: unknown): ThemeMode {
  return mode === 'light' || mode === 'dark' || mode === 'system' ? mode : 'system';
}

function buildLight(accent: AccentPalette): ThemeColors {
  const { primary, gradientEnd } = ACCENT_PRIMARIES[accent];
  return {
    primary,
    primaryMuted: primary + 'CC',
    primarySoft: primary + '18',
    onPrimary: '#FFFFFF',
    background: '#F4F6FB',
    backgroundElevated: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceContainer: '#FFFFFF',
    surfaceContainerLow: '#F8FAFC',
    surfaceContainerHigh: '#EDF2F7',
    surfaceContainerHighest: '#E2E8F0',
    surfaceBright: '#FFFFFF',
    primaryContainer: '#0EA5E9',
    surfaceHover: '#F8FAFC',
    border: '#E8ECF4',
    borderSubtle: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    success: '#10B981',
    successSoft: '#10B98118',
    danger: '#EF4444',
    dangerSoft: '#EF444418',
    warning: '#F59E0B',
    warningSoft: '#F59E0B18',
    secondary: '#10B981',
    secondaryFixed: '#6FFBBE',
    secondaryContainer: '#D1FAE5',
    violet: '#8B5CF6',
    rose: '#F43F5E',
    emerald: '#059669',
    ocean: '#0284C7',
    gradientStart: primary,
    gradientEnd,
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8ECF4',
    overlay: 'rgba(15, 23, 42, 0.45)',
    inputBg: '#F8FAFC',
  };
}

function buildDark(accent: AccentPalette): ThemeColors {
  const { primary, gradientEnd } = ACCENT_PRIMARIES[accent];
  return {
    primary,
    primaryMuted: primary + 'DD',
    primarySoft: primary + '28',
    onPrimary: '#FFFFFF',
    background: '#0E131D',
    backgroundElevated: '#151C2F',
    surfaceElevated: '#151C2F',
    surface: '#1B202A',
    surfaceContainer: '#1B202A',
    surfaceContainerLow: '#171C26',
    surfaceContainerHigh: '#252A35',
    surfaceContainerHighest: '#303540',
    surfaceBright: '#343945',
    primaryContainer: '#0EA5E9',
    surfaceHover: '#24304C',
    border: '#3A4A6E',
    borderSubtle: '#2C3A5C',
    text: '#F8FAFC',
    textSecondary: '#B0BDCF',
    textTertiary: '#8B9BB5',
    success: '#4EDEA3',
    successSoft: '#4EDEA322',
    danger: '#F87171',
    dangerSoft: '#F8717122',
    warning: '#FBBF24',
    warningSoft: '#FBBF2422',
    secondary: '#4EDEA3',
    secondaryFixed: '#6FFBBE',
    secondaryContainer: '#00A572',
    violet: '#8B5CF6',
    rose: '#F43F5E',
    emerald: '#10B981',
    ocean: '#0EA5E9',
    gradientStart: primary,
    gradientEnd,
    tabBar: '#151C2F',
    tabBarBorder: '#3A4A6E',
    overlay: 'rgba(0, 0, 0, 0.65)',
    inputBg: '#171C26',
  };
}

export function getThemeColors(mode: 'light' | 'dark', accent: unknown): ThemeColors {
  const resolvedAccent = resolveAccent(accent);
  return mode === 'dark' ? buildDark(resolvedAccent) : buildLight(resolvedAccent);
}

export const ACCENT_OPTIONS: Array<{ id: AccentPalette; label: string; swatch: string }> = [
  { id: 'indigo', label: 'Indigo', swatch: '#6366F1' },
  { id: 'emerald', label: 'Emerald', swatch: '#10B981' },
  { id: 'ocean', label: 'Ocean', swatch: '#0EA5E9' },
  { id: 'rose', label: 'Rose', swatch: '#F43F5E' },
  { id: 'violet', label: 'Violet', swatch: '#8B5CF6' },
];
