import { useState, useCallback } from 'react';
import { useAppSelector } from '@/shared/store/hooks';

export function useEntitlement() {
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

  return {
    isEntitled,
    role: user?.role ?? 'free',
    paywallVisible,
    openPaywall,
    closePaywall,
  };
}
