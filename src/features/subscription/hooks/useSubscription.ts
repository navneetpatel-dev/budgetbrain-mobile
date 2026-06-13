import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { purchasePackage, restorePurchases, isPurchasesConfigured, getOfferings } from '@/shared/services/purchases';
import { apiPost } from '@/shared/services/api';
import { trackEvent } from '@/shared/services/analytics';

export interface PackageInfo {
  identifier: string;
  title: string;
  price: string;
}

export function useSubscription() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const configured = isPurchasesConfigured();

  useEffect(() => {
    async function loadOfferings() {
      if (!configured) {
        setLoadingOfferings(false);
        return;
      }
      try {
        const offerings = await getOfferings();
        const available = offerings?.current?.availablePackages ?? [];
        setPackages(
          available.map((pkg) => ({
            identifier: pkg.identifier,
            title: pkg.product.title || pkg.identifier,
            price: pkg.product.priceString,
          }))
        );
      } catch {
        setPackages([]);
      } finally {
        setLoadingOfferings(false);
      }
    }
    loadOfferings();
  }, [configured]);

  const handlePurchase = async (packageId: string) => {
    if (!configured) {
      Alert.alert(
        'Not Available',
        'Set EXPO_PUBLIC_REVENUECAT_IOS_KEY or EXPO_PUBLIC_REVENUECAT_ANDROID_KEY to enable in-app purchases.'
      );
      return;
    }

    setLoading(packageId);
    try {
      await purchasePackage({ identifier: packageId });
      await apiPost('/subscriptions/restore', {});
      trackEvent('subscription_purchased', { plan: packageId });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      Alert.alert('Success', 'Welcome to Premium!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      if (!message.includes('cancelled')) {
        Alert.alert('Purchase Failed', message);
      }
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async () => {
    if (!configured) {
      Alert.alert('Not Available', 'RevenueCat is not configured. Set platform-specific API keys in your environment.');
      return;
    }

    setLoading('restore');
    try {
      const customerInfo = await restorePurchases();
      const result = await apiPost<{ restored: boolean }>('/subscriptions/restore', {
        revenueCatId: customerInfo.originalAppUserId,
      });
      Alert.alert(result.restored ? 'Restored' : 'No Purchases', result.restored ? 'Your subscription has been restored.' : 'No active subscription found.');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    } catch {
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(null);
    }
  };

  return {
    loading,
    packages,
    loadingOfferings,
    configured,
    handlePurchase,
    handleRestore,
    goBack: () => router.back(),
  };
}
