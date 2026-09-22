import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import type { AiAnomaly } from '@/shared/types';
import { createStyles, createClearStyles } from './AiAnomalyCard.styles';

const ANOMALY_LABELS: Record<AiAnomaly['type'], { label: string; icon: AppIconName }> = {
  duplicate_expense: { label: 'Possible duplicate', icon: 'document' },
  spending_spike: { label: 'Spending spike', icon: 'trendingUp' },
  subscription_cost_increase: { label: 'Subscription cost increase', icon: 'bell' },
  unusual_transaction: { label: 'Unusual transaction', icon: 'shield' },
};

export function AiAnomalyCard({
  type,
  reason,
  meta,
}: {
  type: AiAnomaly['type'];
  reason: string;
  meta: string;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const info = ANOMALY_LABELS[type] ?? { label: 'Unusual activity', icon: 'shield' as AppIconName };

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <AppIcon name={info.icon} size={16} color={theme.colors.warning} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{info.label}</Text>
        <Text style={styles.reason}>{reason}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
    </View>
  );
}

export function AiAnomalyClear() {
  const theme = useTheme();
  const styles = useMemo(() => createClearStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <AppIcon name="checkmark" size={18} color={theme.colors.success} />
      </View>
      <View>
        <Text style={styles.title}>All clear</Text>
        <Text style={styles.subtitle}>No unusual spending detected</Text>
      </View>
    </View>
  );
}
