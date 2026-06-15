import { useRef } from 'react';
import { apiPatch } from '@/shared/services/api';
import { setTheme, setAccent } from '@/shared/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { AccentPalette, ThemeMode } from '@/shared/theme/types';

export function useSyncedPreferences() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const syncRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const sync = (data: { theme?: ThemeMode; accent?: AccentPalette }) => {
    if (!isAuthenticated) return;
    clearTimeout(syncRef.current);
    syncRef.current = setTimeout(() => {
      void apiPatch('/users/me', data).catch(() => {});
    }, 400);
  };

  return {
    theme: settings.theme,
    accent: settings.accent,
    setThemeMode: (mode: ThemeMode) => {
      dispatch(setTheme(mode));
      sync({ theme: mode });
    },
    setAccentPalette: (accent: AccentPalette) => {
      dispatch(setAccent(accent));
      sync({ accent });
    },
  };
}
