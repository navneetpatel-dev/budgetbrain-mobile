import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { ProgressBar } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { buildCategoryChartItems, type CategoryChartInput } from '@/shared/utils/categoryChart';

interface Props {
  data: CategoryChartInput[];
  currency: string;
}

export function CategoryChart({ data, currency }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const items = useMemo(() => buildCategoryChartItems(data), [data]);

  if (!data.length) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <AppIcon name="chart" size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyText}>No spending data yet</Text>
        <Text style={styles.emptyHint}>Add expenses to see your breakdown</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.pct}>{item.pct}%</Text>
          </View>
          <View style={styles.barRow}>
            <ProgressBar progress={item.pct} color={item.color} height={8} style={styles.barTrack} />
            <Text style={styles.amount}>
              {formatCurrency(item.total, currency)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { gap: t.spacing.md },
    empty: { paddingVertical: t.spacing.xl, alignItems: 'center' },
    emptyIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: t.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.md,
    },
    emptyText: { ...t.typography.bodySemibold, color: t.colors.text },
    emptyHint: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 4 },
    row: { gap: 8 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
    dot: { width: 8, height: 8, borderRadius: 4 },
    name: { flex: 1, ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    pct: { ...t.typography.caption, color: t.colors.textTertiary, fontWeight: '600' },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
    barTrack: { flex: 1 },
    amount: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontWeight: '600',
      minWidth: 64,
      textAlign: 'right',
      fontVariant: ['tabular-nums'],
    },
  });
}
