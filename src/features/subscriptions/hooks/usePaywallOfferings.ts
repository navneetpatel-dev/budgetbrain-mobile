import { useEffect, useState, useCallback } from 'react';
import type { PurchasesPackage } from 'react-native-purchases';
import { getCurrentOffering, isPurchasesConfigured } from '@/shared/services/purchases';

interface PaywallOfferings {
  monthly: PurchasesPackage | null;
  annual: PurchasesPackage | null;
  lifetime: PurchasesPackage | null;
  loading: boolean;
  /** True once RevenueCat has a configured API key on this platform build. */
  purchasesAvailable: boolean;
}

const empty: Omit<PaywallOfferings, 'loading' | 'purchasesAvailable'> = {
  monthly: null,
  annual: null,
  lifetime: null,
};

/** Fetches the current RevenueCat offering's standard monthly/annual/lifetime packages. */
export function usePaywallOfferings(visible: boolean): PaywallOfferings {
  const [packages, setPackages] = useState(empty);
  const [loading, setLoading] = useState(false);
  const purchasesAvailable = isPurchasesConfigured();

  const load = useCallback(async () => {
    if (!purchasesAvailable) return;
    setLoading(true);
    const offering = await getCurrentOffering();
    setPackages({
      monthly: offering?.monthly ?? null,
      annual: offering?.annual ?? null,
      lifetime: offering?.lifetime ?? null,
    });
    setLoading(false);
  }, [purchasesAvailable]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard async data-fetch-on-visible pattern; `load` sets loading state before its network call.
    if (visible) load();
  }, [visible, load]);

  return { ...packages, loading, purchasesAvailable };
}
