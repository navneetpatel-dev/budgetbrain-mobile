import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/store/hooks';
import { getAccessToken, apiGet } from '@/shared/services/api';
import { setUser, setLoading } from '@/shared/store/authSlice';
import { identifyUser } from '@/shared/services/analytics';
import { registerForPushNotifications } from '@/shared/services/notifications';
import type { User } from '@/shared/types';

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await apiGet<User>('/users/me');
          dispatch(setUser(profile));
          identifyUser(profile.id, { email: profile.email, role: profile.role });
          registerForPushNotifications().catch(() => {});
        } else {
          dispatch(setLoading(false));
        }
      } catch {
        dispatch(setLoading(false));
      }
    }
    bootstrap();
  }, [dispatch]);
}
