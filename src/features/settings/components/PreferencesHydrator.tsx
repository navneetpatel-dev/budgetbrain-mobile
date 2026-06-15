import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { hydratePreferences } from '@/shared/store/settingsSlice';

/** Applies server-stored theme/accent whenever the authenticated user changes. */
export function PreferencesHydrator() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;
    dispatch(hydratePreferences({ theme: user.theme, accent: user.accent }));
  }, [dispatch, user?.id, user?.theme, user?.accent]);

  return null;
}
