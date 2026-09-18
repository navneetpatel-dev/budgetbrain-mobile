import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { createStyles } from './PaywallModal.styles';

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

  const handlePurchase = () => {
    Alert.alert(
      'BudgetBrain Pro',
      'In-app purchases are powered by RevenueCat. Apple & Google Play Store billing will connect in production builds.',
      [{ text: 'OK', onPress: onClose }],
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'Checking your active subscriptions...',
      [{ text: 'OK' }],
    );
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
                  <Text style={styles.planPrice}>₹1,499</Text>
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
                  <Text style={styles.planPrice}>₹199</Text>
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
                  <Text style={styles.planPrice}>₹3,999</Text>
                  <Text style={styles.planSubtext}>one-time</Text>
                </View>
              </Pressable>
            </View>

            {/* CTA */}
            <Pressable
              onPress={handlePurchase}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.ctaText}>
                {selectedPlan === 'lifetime'
                  ? 'Get Lifetime Access'
                  : 'Start 7-Day Free Trial'}
              </Text>
            </Pressable>

            {/* Restore */}
            <Pressable onPress={handleRestore} style={styles.restoreBtn}>
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
