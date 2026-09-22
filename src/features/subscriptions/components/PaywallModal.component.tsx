import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useScreenInsets, useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { createStyles } from './PaywallModal.styles';
import { openWebUpgrade, type WebUpgradePlan } from '../api/webHandoff.api';

export interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureTitle?: string;
}

const PLANS: { plan: WebUpgradePlan; label: string; tag: string | null; price: string; cadence: string }[] = [
  { plan: 'yearly', label: 'Annual Plan', tag: 'SAVE 37% · MOST POPULAR', price: '₹1,499', cadence: '/ year' },
  { plan: 'monthly', label: 'Monthly Plan', tag: null, price: '₹199', cadence: '/ month' },
  { plan: 'lifetime', label: 'Lifetime Access', tag: 'PAY ONCE · FOREVER', price: '₹3,999', cadence: 'one-time' },
];

export function PaywallModal({
  visible,
  onClose,
  featureTitle = 'Unlock BudgetBrain Pro',
}: PaywallModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bottomSafe = useBottomSafeInset();
  const { paddingHorizontal } = useScreenInsets();
  const [selectedPlan, setSelectedPlan] = useState<WebUpgradePlan>('yearly');
  const [opening, setOpening] = useState(false);

  const handleContinue = async () => {
    setOpening(true);
    try {
      await openWebUpgrade(selectedPlan);
      onClose();
    } catch {
      Alert.alert(
        'Could not open checkout',
        'Something went wrong opening budgetbrain.app. Please check your connection and try again.',
      );
    } finally {
      setOpening(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheetContainer,
            {
              marginHorizontal: paddingHorizontal,
              marginBottom: bottomSafe,
              paddingBottom: theme.spacing.lg,
            },
          ]}
        >
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

            {/* Plan cards — the selection carries through to the web checkout page as a
                preselected/highlighted plan; the charge itself is still created there. */}
            <View style={styles.planList}>
              {PLANS.map((item) => (
                <Pressable
                  key={item.plan}
                  onPress={() => setSelectedPlan(item.plan)}
                  style={[
                    styles.planCard,
                    selectedPlan === item.plan && styles.planCardSelected,
                  ]}
                >
                  <View style={styles.planLeft}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedPlan === item.plan && styles.radioCircleActive,
                      ]}
                    >
                      {selectedPlan === item.plan && <View style={styles.radioInner} />}
                    </View>
                    <View>
                      <Text style={styles.planTitle}>{item.label}</Text>
                      {item.tag ? <Text style={styles.planTag}>{item.tag}</Text> : null}
                    </View>
                  </View>
                  <View>
                    <Text style={styles.planPrice}>{item.price}</Text>
                    <Text style={styles.planSubtext}>{item.cadence}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* CTA */}
            <Pressable
              onPress={handleContinue}
              disabled={opening}
              style={({ pressed }) => [
                styles.ctaButton,
                (pressed || opening) && { opacity: 0.7 },
              ]}
            >
              {opening ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.ctaText}>Continue to budgetbrain.app</Text>
              )}
            </Pressable>

            <Text style={styles.legalText}>
              Subscriptions are purchased securely on budgetbrain.app and auto-renew unless cancelled at least 24 hours before the end of the billing period.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
