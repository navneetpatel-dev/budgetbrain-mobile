import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { createStyles } from './PaywallModal.styles';
import { usePaywallOfferings } from '../hooks/usePaywallOfferings';
import { useEntitlement } from '../hooks/useEntitlement';
import { purchasePackage, restorePurchases, ensurePurchasesIdentity } from '@/shared/services/purchases';
import { useAppSelector } from '@/shared/store/hooks';

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureTitle?: string;
}

type PlanType = 'monthly' | 'yearly' | 'lifetime';

export function PaywallModal({
  visible,
  onClose,
  featureTitle = 'Unlock BudgetBrain Pro',
}: PaywallModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [purchasing, setPurchasing] = useState(false);
  const { refreshEntitlement } = useEntitlement();
  const { monthly, annual, lifetime, loading, purchasesAvailable } = usePaywallOfferings(visible);
  const userId = useAppSelector((state) => state.auth.user?.id);

  const packageForPlan: Record<PlanType, PurchasesPackage | null> = {
    monthly,
    yearly: annual,
    lifetime,
  };
  const selectedPackage = packageForPlan[selectedPlan];

  const priceFor = (plan: PlanType, fallback: string) =>
    packageForPlan[plan]?.product.priceString ?? fallback;

  const handlePurchase = async () => {
    if (!purchasesAvailable) {
      Alert.alert(
        'Not available yet',
        'In-app purchases aren’t configured on this build yet. Please try again later.',
      );
      return;
    }
    if (!selectedPackage) {
      Alert.alert(
        'Plan unavailable',
        'This plan isn’t available right now. Please try another plan or check back shortly.',
      );
      return;
    }
    setPurchasing(true);

    // Confirm RevenueCat's identity matches the signed-in user before charging them —
    // if this doesn't match, the backend's webhook (keyed on this app_user_id) would
    // silently fail to attribute the purchase to anyone, and the customer would pay
    // with no entitlement ever granted.
    const identityConfirmed = userId ? await ensurePurchasesIdentity(userId) : false;
    if (!identityConfirmed) {
      setPurchasing(false);
      Alert.alert(
        'One moment',
        'Still setting up your account. Please try again in a few seconds.',
      );
      return;
    }

    const result = await purchasePackage(selectedPackage);
    if (result.status === 'success') {
      const entitled = await refreshEntitlement();
      setPurchasing(false);
      Alert.alert(
        entitled ? 'Welcome to Pro' : 'Purchase complete',
        entitled
          ? 'Your premium features are now unlocked.'
          : 'Your purchase went through. It may take a moment to reflect — reopen this screen if it still shows locked.',
        [{ text: 'OK', onPress: onClose }],
      );
    } else if (result.status === 'cancelled') {
      setPurchasing(false);
    } else {
      setPurchasing(false);
      Alert.alert('Purchase failed', result.message);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const result = await restorePurchases();
    if (result.status === 'success') {
      const entitled = await refreshEntitlement();
      setPurchasing(false);
      Alert.alert(
        entitled ? 'Purchases restored' : 'Restore complete',
        entitled
          ? 'Your premium access has been restored.'
          : 'No active premium purchase was found on this account.',
        entitled ? [{ text: 'OK', onPress: onClose }] : [{ text: 'OK' }],
      );
    } else if (result.status === 'cancelled') {
      setPurchasing(false);
    } else {
      setPurchasing(false);
      Alert.alert('Restore failed', result.message);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />

          <View style={styles.headerRow}>
            <View style={styles.badgePod}>
              <Text style={styles.badgeText}>PRO</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Close"
            >
              <AppIcon name="close" size={16} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{featureTitle}</Text>
            <Text style={styles.subtitle}>
              Take complete command of your finances with unlimited AI insights, high-res exports, and intelligent anomaly detection.
            </Text>

            {/* Feature List */}
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.featureCheckPod}>
                  <AppIcon name="checkmark" size={14} color={theme.colors.success ?? '#10B981'} />
                </View>
                <Text style={styles.featureText}>Unlimited AI Financial Chat & Anomaly Radar</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureCheckPod}>
                  <AppIcon name="checkmark" size={14} color={theme.colors.success ?? '#10B981'} />
                </View>
                <Text style={styles.featureText}>Full-Resolution PDF Statement & Tax Exports</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureCheckPod}>
                  <AppIcon name="checkmark" size={14} color={theme.colors.success ?? '#10B981'} />
                </View>
                <Text style={styles.featureText}>Multi-Device Instant Cloud & Offline Sync</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureCheckPod}>
                  <AppIcon name="checkmark" size={14} color={theme.colors.success ?? '#10B981'} />
                </View>
                <Text style={styles.featureText}>Family Group Sharing & Real-Time Split Ledger</Text>
              </View>
            </View>

            {/* Plan Cards */}
            <View style={styles.planList}>
              <Pressable
                onPress={() => setSelectedPlan('yearly')}
                style={[
                  styles.planCard,
                  selectedPlan === 'yearly' && styles.planCardSelected,
                ]}
              >
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === 'yearly' && styles.radioCircleActive,
                    ]}
                  >
                    {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.planTitle}>Annual Plan</Text>
                    <Text style={styles.planTag}>SAVE 37% · MOST POPULAR</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.planPrice}>{priceFor('yearly', '₹1,499')}</Text>
                  <Text style={styles.planSubtext}>/ year</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setSelectedPlan('monthly')}
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.planCardSelected,
                ]}
              >
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === 'monthly' && styles.radioCircleActive,
                    ]}
                  >
                    {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.planTitle}>Monthly Plan</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.planPrice}>{priceFor('monthly', '₹199')}</Text>
                  <Text style={styles.planSubtext}>/ month</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setSelectedPlan('lifetime')}
                style={[
                  styles.planCard,
                  selectedPlan === 'lifetime' && styles.planCardSelected,
                ]}
              >
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedPlan === 'lifetime' && styles.radioCircleActive,
                    ]}
                  >
                    {selectedPlan === 'lifetime' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.planTitle}>Lifetime Access</Text>
                    <Text style={styles.planTag}>PAY ONCE · FOREVER</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.planPrice}>{priceFor('lifetime', '₹3,999')}</Text>
                  <Text style={styles.planSubtext}>one-time</Text>
                </View>
              </Pressable>
            </View>

            {/* CTA */}
            <Pressable
              onPress={handlePurchase}
              disabled={purchasing || loading}
              style={({ pressed }) => [
                styles.ctaButton,
                (pressed || purchasing || loading) && { opacity: 0.7 },
              ]}
            >
              {purchasing ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.ctaText}>
                  {selectedPlan === 'lifetime'
                    ? 'Get Lifetime Access'
                    : selectedPlan === 'yearly'
                      ? 'Subscribe Yearly'
                      : 'Subscribe Monthly'}
                </Text>
              )}
            </Pressable>

            {/* Restore */}
            <Pressable onPress={handleRestore} style={styles.restoreBtn} disabled={purchasing}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </Pressable>

            <Text style={styles.legalText}>
              Subscriptions auto-renew unless cancelled at least 24 hours before the end of the billing period.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
