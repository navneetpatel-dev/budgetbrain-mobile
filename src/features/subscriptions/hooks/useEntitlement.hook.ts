import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/shared/store/hooks';
import { apiGet } from '@/shared/services/api';
import { setUser } from '@/shared/store/authSlice';
import type { User } from '@/shared/types';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useEntitlement() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [paywallVisible, setPaywallVisible] = useState(false);

  // Admin, lifetime, and premium users have full entitlement
  const isEntitled =
    !!user &&
    (user.role === 'premium' || user.role === 'lifetime' || user.role === 'admin');

  const openPaywall = useCallback(() => {
    setPaywallVisible(true);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  /**
   * The backend's Subscription/role state is the entitlement source of truth, synced from
   * the Razorpay webhook once the user completes checkout on web — which can lag their return
   * to the app by a few seconds. Poll `/users/me` a few times so the paywall doesn't stay stuck
   * showing "free" right after a successful web purchase.
   */
  const refreshEntitlement = useCallback(async (): Promise<boolean> => {
    const delays = [0, 1500, 3000, 5000];
    for (const delay of delays) {
      if (delay) await wait(delay);
      try {
        const profile = await apiGet<User>('/users/me');
        dispatch(setUser(profile));
        if (profile.role === 'premium' || profile.role === 'lifetime' || profile.role === 'admin') {
          return true;
        }
      } catch {
        // Keep polling on transient network errors.
      }
    }
    return false;
  }, [dispatch]);

  return {
    isEntitled,
    role: user?.role ?? 'free',
    paywallVisible,
    openPaywall,
    closePaywall,
    refreshEntitlement,
  };
}
