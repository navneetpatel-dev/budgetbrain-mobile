import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '@/src/components/ui';
import { COLORS } from '@/src/constants/config';
import { purchasePackage, restorePurchases, isPurchasesConfigured, getOfferings } from '@/src/services/purchases';
import { apiPost } from '@/src/services/api';
import { trackEvent } from '@/src/services/analytics';
import { useQueryClient } from '@tanstack/react-query';

interface PackageInfo {
  identifier: string;
  title: string;
  price: string;
}

export default function SubscriptionScreen() {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.subtitle}>Unlock AI insights, unlimited budgets, family accounts, and more</Text>

      {loadingOfferings ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : packages.length > 0 ? (
        packages.map((pkg) => (
          <Card key={pkg.identifier} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{pkg.title}</Text>
              <Text style={styles.planPrice}>{pkg.price}</Text>
            </View>
            <Button
              title={loading === pkg.identifier ? 'Processing...' : `Choose ${pkg.title}`}
              onPress={() => handlePurchase(pkg.identifier)}
              loading={loading === pkg.identifier}
              disabled={!!loading}
            />
          </Card>
        ))
      ) : (
        <Card style={styles.planCard}>
          <Text style={styles.fallbackText}>
            {configured
              ? 'No subscription packages available. Configure offerings in RevenueCat dashboard.'
              : 'In-app purchases require RevenueCat API keys (EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY).'}
          </Text>
        </Card>
      )}

      <Button title="Restore Purchases" onPress={handleRestore} variant="outline" loading={loading === 'restore'} />
      <Button title="Maybe Later" onPress={() => router.back()} variant="outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  loader: { marginVertical: 24 },
  planCard: { marginBottom: 12 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  planPrice: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  fallbackText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
});
