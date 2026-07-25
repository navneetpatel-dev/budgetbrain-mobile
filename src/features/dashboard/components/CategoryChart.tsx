import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { ProgressBar } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { buildCategoryChartItems, type CategoryChartInput } from '@/shared/utils/categoryChart';

interface Props {
  data: CategoryChartInput[];
  currency: string;
  onCategoryPress?: (categoryId: string) => void;
}

export function CategoryChart({ data, currency, onCategoryPress }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const items = useMemo(() => buildCategoryChartItems(data), [data]);

  if (!data.length) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <AppIcon name="chart" size={22} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyText}>No spending data yet</Text>
        <Text style={styles.emptyHint}>Add expenses to see your breakdown</Text>
      </View>
    );
  }

  return (
    <View>
      {items.map((item, i) => {
        const row = (
          <>
            <View style={styles.header}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.pct}>{item.pct}%</Text>
            </View>
            <ProgressBar progress={item.pct} color={item.color} height={6} />
            <Text style={styles.meta}>
              {formatCurrency(item.total, currency)}
            </Text>
          </>
        );

        const rowStyle = [
          styles.row,
          i === 0 && styles.rowFirst,
          i === items.length - 1 && styles.rowLast,
          i < items.length - 1 && styles.rowDivider,
        ];

        if (!onCategoryPress) {
          return (
            <View key={item.id} style={rowStyle}>
              {row}
            </View>
          );
        }

        return (
          <Pressable
            key={item.id}
            onPress={() => onCategoryPress(item.id)}
            style={({ pressed }) => [...rowStyle, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name} transactions`}
          >
            {row}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    empty: { paddingVertical: t.spacing.lg, paddingHorizontal: t.spacing.lg, alignItems: 'center' },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.sm,
    },
    emptyText: { fontSize: 15, fontWeight: '600', color: t.colors.text },
    emptyHint: { fontSize: 13, fontWeight: '500', color: t.colors.textTertiary, marginTop: 4 },
    row: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 14,
    },
    rowFirst: { paddingTop: t.spacing.md },
    rowLast: { paddingBottom: t.spacing.md },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    name: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.1,
      color: t.colors.text,
    },
    pct: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
    meta: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
      marginTop: 8,
      fontVariant: ['tabular-nums'],
    },
  });
}
