import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button, Card, FormStackScreen, FormSection, SubscriptionSkeleton } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';

export default function SubscriptionScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, packages, loadingOfferings, configured, handlePurchase, handleRestore, goBack } = useSubscription();

  return (
    <FormStackScreen eyebrow="PREMIUM" title="Upgrade" subtitle="Unlock AI, family accounts, and more" onBack={goBack}>
      {loadingOfferings ? (
        <SubscriptionSkeleton />
      ) : packages.length > 0 ? (
        <FormSection title="Choose a plan" subtitle="Cancel anytime from App Store settings">
          {packages.map((pkg) => (
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
          ))}
        </FormSection>
      ) : (
        <FormSection title="Setup required">
          <Text style={styles.fallbackText}>
            {configured
              ? 'No subscription packages available. Configure offerings in RevenueCat dashboard.'
              : 'In-app purchases require RevenueCat API keys (EXPO_PUBLIC_REVENUECAT_IOS_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_KEY).'}
          </Text>
        </FormSection>
      )}

      <Button title="Restore Purchases" onPress={handleRestore} variant="outline" loading={loading === 'restore'} />
      <Button title="Maybe Later" onPress={goBack} variant="ghost" />
    </FormStackScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    planCard: { marginBottom: t.spacing.sm },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    planName: { fontSize: 18, fontWeight: '700', color: t.colors.text },
    planPrice: { fontSize: 16, fontWeight: '600', color: t.colors.primary },
    fallbackText: { fontSize: 14, color: t.colors.textSecondary, lineHeight: 20 },
  });
}
