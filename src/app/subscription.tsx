import { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, useScrollContentStyle } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';

export default function SubscriptionScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, packages, loadingOfferings, configured, handlePurchase, handleRestore, goBack } = useSubscription();
  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.subtitle}>Unlock AI insights, unlimited budgets, family accounts, and more</Text>

      {loadingOfferings ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
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
      <Button title="Maybe Later" onPress={goBack} variant="outline" />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    title: { fontSize: 26, fontWeight: '800', color: t.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: t.colors.textSecondary, marginBottom: 24 },
    loader: { marginVertical: 24 },
    planCard: { marginBottom: 12 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    planName: { fontSize: 18, fontWeight: '700', color: t.colors.text },
    planPrice: { fontSize: 16, fontWeight: '600', color: t.colors.primary },
    fallbackText: { fontSize: 14, color: t.colors.textSecondary, lineHeight: 20 },
  });
}
