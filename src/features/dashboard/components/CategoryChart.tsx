import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppIcon } from '@/src/features/navigation/components/AppIcon';
import { useTheme } from '@/src/shared/theme';
import { formatCurrency } from '@/src/shared/utils/currency';
import type { Category } from '@/src/shared/types';

interface Props {
  data: Array<{ categoryId: string; total: string; category?: Category }>;
  currency: string;
}

const FALLBACK_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function CategoryChart({ data, currency }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const sorted = [...data]
    .map((item, index) => ({
      name: item.category?.name ?? 'Other',
      total: Number(item.total),
      color: item.category?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const max = Math.max(...sorted.map((d) => d.total), 1);
  const total = sorted.reduce((s, d) => s + d.total, 0);

  return (
    <View style={styles.container}>
      {sorted.map((item) => {
        const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
        return (
          <View key={item.name} style={styles.row}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.pct}>{pct}%</Text>
            </View>
            <View style={styles.barRow}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(item.total / max) * 100}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
              <Text style={styles.amount}>
                {formatCurrency(item.total, currency)}
              </Text>
            </View>
          </View>
        );
      })}
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
    barTrack: {
      flex: 1,
      height: 8,
      backgroundColor: t.colors.borderSubtle,
      borderRadius: t.radii.full,
      overflow: 'hidden',
    },
    barFill: { height: '100%', borderRadius: t.radii.full },
    amount: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontWeight: '600',
      minWidth: 64,
      textAlign: 'right',
    },
  });
}
