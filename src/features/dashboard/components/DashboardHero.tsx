import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { RingGauge } from '@/shared/components/ui/RingGauge';
import { SkeletonBlock } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { useCountUp } from '@/shared/hooks/useCountUp';
import { formatCurrency } from '@/shared/utils/currency';
import { appHref } from '@/shared/utils/navigation';

export interface DashboardHeroProps {
  name: string;
  amount: number;
  currency: string;
  savingsRate?: number;
  goalAmount?: number;
  loading?: boolean;
}

export function DashboardHero({
  name,
  amount,
  currency,
  savingsRate = 18.4,
  goalAmount,
  loading = false,
}: DashboardHeroProps) {
  const theme = useTheme();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const animatedAmount = useCountUp(amount);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const fade = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [fade, reducedMotion, amount]);

  const targetProgress = Math.min(100, Math.max(10, Math.round(savingsRate || 25)));

  return (
    <View style={styles.container}>
      {/* Hero Overview Card */}
      <View style={styles.heroCard}>
        {/* Ambient Glows */}
        <View style={styles.ambientGlowRight} pointerEvents="none" />
        <View style={styles.ambientGlowLeft} pointerEvents="none" />

        <View style={styles.heroContent}>
          {/* Top Status Row */}
          <View style={styles.topStatusRow}>
            <View style={styles.greetingRow}>
              <View style={styles.livePulseContainer}>
                <View style={[styles.livePulseDot, { backgroundColor: theme.colors.secondary }]} />
              </View>
              <Text style={styles.greetingText}>
                Good {getGreeting()}, {name}
              </Text>
            </View>

            {savingsRate !== undefined ? (
              <View style={styles.savingsChip}>
                <AppIcon name="chart" size={12} color={theme.colors.secondary} />
                <Text style={styles.savingsChipText}>
                  {savingsRate > 0 ? `+${Math.round(savingsRate)}%` : `${Math.round(savingsRate)}%`} saved
                </Text>
              </View>
            ) : null}
          </View>

          {/* Amount & Ring Visualizer Row */}
          <View style={styles.middleRow}>
            <View style={styles.amountCol}>
              <Text style={styles.amountLabel}>Net Savings this month</Text>
              {loading ? (
                <View style={styles.skeletonWrap}>
                  <SkeletonBlock width={140} height={32} radius={8} />
                </View>
              ) : (
                <Animated.Text style={[styles.amountText, { opacity: fade }]} numberOfLines={1}>
                  {formatCurrency(animatedAmount, currency)}
                </Animated.Text>
              )}
            </View>

            {/* Circular Ring Visualizer */}
            <RingGauge
              size={54}
              strokeWidth={4.5}
              progress={targetProgress}
              icon="budgets"
              gradientColors={[theme.colors.secondary, theme.colors.primary]}
            />
          </View>

          {/* Target on Track Micro-Banner */}
          <View style={styles.targetBanner}>
            <View style={styles.targetLeft}>
              <AppIcon name="checkmark" size={15} color={theme.colors.secondary} />
              <Text style={styles.targetText} numberOfLines={1}>
                Target on track{goalAmount ? `: ${formatCurrency(goalAmount, currency)} goal` : ''}
              </Text>
            </View>
            <Text style={styles.targetDaysLeft}>Cycle active</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions Row */}
      <View style={styles.quickActionsGrid}>
        {/* Expense Button */}
        <Pressable
          onPress={() => router.push(appHref('/expense/add'))}
          style={({ pressed }) => [styles.actionPressable, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel="Log Expense"
        >
          <LinearGradient
            colors={[theme.colors.ocean, theme.colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionPrimaryGradient}
          >
            <View style={styles.actionPrimaryIconCircle}>
              <AppIcon name="add" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.actionPrimaryLabel}>Expense</Text>
          </LinearGradient>
        </Pressable>

        {/* Income Button */}
        <Pressable
          onPress={() => router.push(appHref('/income/add'))}
          style={({ pressed }) => [styles.actionPressable, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel="Log Income"
        >
          <View style={styles.actionSecondaryBtn}>
            <View style={[styles.actionSecondaryIconCircle, { backgroundColor: theme.colors.secondary + '20' }]}>
              <AppIcon name="income" size={16} color={theme.colors.secondary} />
            </View>
            <Text style={styles.actionSecondaryLabel}>Income</Text>
          </View>
        </Pressable>

        {/* Scan Slip Button */}
        <Pressable
          onPress={() => router.push(appHref('/expense/add'))}
          style={({ pressed }) => [styles.actionPressable, pressed && styles.actionPressed]}
          accessibilityRole="button"
          accessibilityLabel="Scan Slip"
        >
          <View style={styles.actionSecondaryBtn}>
            <View style={[styles.actionSecondaryIconCircle, { backgroundColor: theme.colors.violet + '20' }]}>
              <AppIcon name="document" size={16} color={theme.colors.violet} />
            </View>
            <Text style={styles.actionSecondaryLabel}>Scan Slip</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      gap: t.spacing.md,
      marginBottom: t.spacing.sm,
    },
    heroCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.xl,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.md,
      position: 'relative',
      overflow: 'hidden',
    },
    ambientGlowRight: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: t.colors.primary + '16',
    },
    ambientGlowLeft: {
      position: 'absolute',
      bottom: -40,
      left: -40,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: t.colors.violet + '14',
    },
    heroContent: {
      gap: t.spacing.md,
    },
    topStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    livePulseContainer: {
      width: 10,
      height: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    livePulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    greetingText: {
      fontSize: 13,
      fontWeight: '500',
      color: t.colors.textSecondary,
    },
    savingsChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.secondary + '1C',
    },
    savingsChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    middleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    amountCol: {
      flex: 1,
      gap: 4,
    },
    amountLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    amountText: {
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.8,
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
      fontFamily: t.typography.display.fontFamily,
    },
    skeletonWrap: {
      paddingVertical: 4,
    },
    targetBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.borderSubtle,
    },
    targetLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    targetText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textSecondary,
    },
    targetDaysLeft: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.primary,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      gap: t.spacing.sm,
    },
    actionPressable: {
      flex: 1,
    },
    actionPressed: {
      transform: [{ scale: 0.96 }],
      opacity: 0.9,
    },
    actionPrimaryGradient: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: t.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      ...t.shadows.sm,
    },
    actionPrimaryIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionPrimaryLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    actionSecondaryBtn: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      ...t.shadows.sm,
    },
    actionSecondaryIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionSecondaryLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: t.colors.text,
    },
  });
}
