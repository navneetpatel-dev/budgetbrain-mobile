import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';

export interface CashFlowHeroProps {
  title?: string;
  totalSpent: number;
  totalEarned: number;
  currency?: string;
  netRate?: number;
  targetCap?: number;
}

export function CashFlowHero({
  title = 'Cash Flow',
  totalSpent,
  totalEarned,
  currency = 'INR',
  netRate,
  targetCap,
}: CashFlowHeroProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const totalFlow = totalSpent + totalEarned;
  const spentPct = totalFlow > 0 ? (totalSpent / totalFlow) * 100 : 0;
  const earnedPct = totalFlow > 0 ? (totalEarned / totalFlow) * 100 : 100;
  const netSurplus = totalEarned - totalSpent;

  return (
    <View style={styles.card}>
      {/* Background ambient accent glows */}
      <View style={styles.glowTopRight} pointerEvents="none" />
      <View style={styles.glowBottomLeft} pointerEvents="none" />

      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.livePulseWrap}>
            <View style={[styles.livePulseDot, { backgroundColor: theme.colors.secondary }]} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        {netRate !== undefined ? (
          <View style={styles.netRateChip}>
            <AppIcon name="arrowUp" size={12} color={theme.colors.secondary} />
            <Text style={styles.netRateText}>
              {netRate > 0 ? `+${Math.round(netRate)}%` : `${Math.round(netRate)}%`} Net
            </Text>
          </View>
        ) : null}
      </View>

      {/* Split Metrics Ribbon */}
      <View style={styles.metricsGrid}>
        {/* Spent Module */}
        <View style={styles.metricModule}>
          <View style={styles.metricModuleTop}>
            <View style={[styles.moduleIconWrap, { backgroundColor: theme.colors.danger + '22' }]}>
              <AppIcon name="expense" size={12} color={theme.colors.danger} />
            </View>
            <Text style={styles.moduleLabel}>Total Spent</Text>
          </View>
          <Text style={[styles.moduleAmount, { color: theme.colors.text }]} numberOfLines={1}>
            -{formatCurrency(totalSpent, currency)}
          </Text>
        </View>

        {/* Earned Module */}
        <View style={styles.metricModule}>
          <View style={styles.metricModuleTop}>
            <View style={[styles.moduleIconWrap, { backgroundColor: theme.colors.secondary + '22' }]}>
              <AppIcon name="income" size={12} color={theme.colors.secondary} />
            </View>
            <Text style={styles.moduleLabel}>Total Earned</Text>
          </View>
          <Text style={[styles.moduleAmount, { color: theme.colors.secondary }]} numberOfLines={1}>
            +{formatCurrency(totalEarned, currency)}
          </Text>
        </View>
      </View>

      {/* Ratio Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressSegmentSpent,
              { width: `${spentPct}%`, backgroundColor: theme.colors.danger },
            ]}
          />
          <View
            style={[
              styles.progressSegmentEarned,
              { width: `${earnedPct}%`, backgroundColor: theme.colors.secondary },
            ]}
          />
        </View>

        <View style={styles.progressFooter}>
          <Text style={styles.footerText}>
            Net Surplus:{' '}
            <Text style={[styles.boldText, { color: netSurplus >= 0 ? theme.colors.secondary : theme.colors.danger }]}>
              {netSurplus >= 0 ? '+' : ''}
              {formatCurrency(netSurplus, currency)}
            </Text>
          </Text>

          {targetCap ? (
            <Text style={styles.footerText}>
              Target Cap: {formatCurrency(targetCap, currency)}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surfaceContainerLow,
      borderRadius: t.radii.card,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.md,
      overflow: 'hidden',
      position: 'relative',
    },
    glowTopRight: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.primary + '14',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.secondary + '14',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    livePulseWrap: {
      width: 8,
      height: 8,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    livePulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.colors.textSecondary,
    },
    netRateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surfaceHover,
    },
    netRateText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: t.spacing.sm,
      marginBottom: t.spacing.md,
    },
    metricModule: {
      flex: 1,
      padding: t.spacing.sm,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerHigh,
      gap: 4,
    },
    metricModuleTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    moduleIconWrap: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    moduleAmount: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      fontVariant: ['tabular-nums'],
    },
    progressContainer: {
      gap: 6,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t.colors.surfaceHover,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    progressSegmentSpent: {
      height: '100%',
    },
    progressSegmentEarned: {
      height: '100%',
    },
    progressFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 11,
      color: t.colors.textTertiary,
    },
    boldText: {
      fontWeight: '700',
      color: t.colors.text,
    },
  });
}
