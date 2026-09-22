import { useRef } from 'react';
import { apiPatch } from '@/shared/services/api';
import { setTheme, setAccent } from '@/shared/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { AccentPalette, ThemeMode } from '@/shared/theme/types';

export function useSyncedPreferences() {
  const dispatch = useAppDispatch();
  // Narrow selectors, not `s.settings` wholesale — the settings slice also carries the
  // offline-sync queue, which mutates far more often than theme/accent do and would
  // otherwise re-render this hook's consumers on every unrelated queue change.
  const theme = useAppSelector((s) => s.settings.theme);
  const accent = useAppSelector((s) => s.settings.accent);
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
    theme,
    accent,
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
