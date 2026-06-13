import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { buildTheme } from './buildTheme';
import { resolveAccent, resolveThemeMode } from './palettes';
import type { AppTheme } from './types';

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = resolveThemeMode(useAppSelector((s) => s.settings.theme));
  const accent = resolveAccent(useAppSelector((s) => s.settings.accent));

  const theme = useMemo(() => {
    const resolved =
      themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
    return buildTheme(resolved, accent, themeMode);
  }, [themeMode, accent, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return buildTheme('light', 'indigo', 'light');
  }
  return ctx;
}
