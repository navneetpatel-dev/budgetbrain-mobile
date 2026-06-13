import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card } from '@/src/components/ui';
import { COLORS, SUBSCRIPTION_PLANS } from '@/src/constants/config';
import { purchasePackage, restorePurchases, isPurchasesConfigured } from '@/src/services/purchases';
import { apiPost } from '@/src/services/api';
import { trackEvent } from '@/src/services/analytics';
import { useQueryClient } from '@tanstack/react-query';

export default function SubscriptionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);
  const configured = isPurchasesConfigured();

  const handlePurchase = async (planKey: string) => {
    if (!configured) {
      Alert.alert('Not Available', 'Set EXPO_PUBLIC_REVENUECAT_API_KEY to enable in-app purchases.');
      return;
    }

    setLoading(planKey);
    try {
      const packageIds: Record<string, string> = {
        monthly: '$rc_monthly',
        yearly: '$rc_annual',
        lifetime: '$rc_lifetime',
      };

      await purchasePackage({ identifier: packageIds[planKey] ?? planKey });
      await apiPost('/subscriptions/restore', {});
      trackEvent('subscription_purchased', { plan: planKey });
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
      Alert.alert('Not Available', 'RevenueCat is not configured.');
      return;
    }

    setLoading('restore');
    try {
      await restorePurchases();
      const result = await apiPost<{ restored: boolean }>('/subscriptions/restore', {});
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

      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
        <Card key={key} style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.label}</Text>
            <Text style={styles.planPrice}>₹{plan.price}{plan.period}</Text>
          </View>
          <Button
            title={loading === key ? 'Processing...' : `Choose ${plan.label}`}
            onPress={() => handlePurchase(key)}
            loading={loading === key}
            disabled={!!loading}
          />
        </Card>
      ))}

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
  planCard: { marginBottom: 12 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  planPrice: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
});
