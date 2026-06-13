import { apiPost, clearTokens, getRefreshToken } from '@/shared/services/api';
import { trackEvent } from '@/shared/services/analytics';
import { queryClient } from '@/shared/services/queryClient';
import { logout } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';

export function useLogout() {
  const dispatch = useAppDispatch();

  return async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await apiPost('/auth/logout', { refreshToken });
    } catch {
      /* proceed */
    }
    await clearTokens();
    dispatch(logout());
    queryClient.clear();
    trackEvent('user_logged_out');
  };
}
