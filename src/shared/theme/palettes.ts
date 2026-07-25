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
    surface: '#FFFFFF',
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
    background: '#0B0F1A',
    backgroundElevated: '#12182B',
    surface: '#161D32',
    surfaceHover: '#1C2540',
    border: '#2A3555',
    borderSubtle: '#1E2844',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    success: '#34D399',
    successSoft: '#34D39922',
    danger: '#F87171',
    dangerSoft: '#F8717122',
    warning: '#FBBF24',
    warningSoft: '#FBBF2422',
    gradientStart: primary,
    gradientEnd,
    tabBar: '#12182B',
    tabBarBorder: '#2A3555',
    overlay: 'rgba(0, 0, 0, 0.65)',
    inputBg: '#1C2540',
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
