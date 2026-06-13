import { useEffect } from 'react';
import { useAppDispatch } from '@/src/shared/store/hooks';
import { getAccessToken, apiGet } from '@/src/shared/services/api';
import { setUser, setLoading } from '@/src/shared/store/authSlice';
import { identifyUser } from '@/src/shared/services/analytics';
import { initPurchases } from '@/src/shared/services/purchases';
import { registerForPushNotifications } from '@/src/shared/services/notifications';
import type { User } from '@/src/shared/types';

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
          await initPurchases(profile.id);
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
