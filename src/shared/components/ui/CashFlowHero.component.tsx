import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { createStyles } from './CashFlowHero.styles';

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
