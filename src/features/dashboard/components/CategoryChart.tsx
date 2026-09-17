import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { SegmentedMacroBar } from '@/shared/components/ui/SegmentedMacroBar';
import { useTheme } from '@/shared/theme';
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

  const macroItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    amount: item.total,
    pct: item.pct,
    color: item.color,
  }));

  return (
    <View style={styles.container}>
      <SegmentedMacroBar
        items={macroItems}
        currency={currency}
        onItemPress={onCategoryPress}
        showLegend={true}
      />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      padding: t.spacing.lg,
    },
    empty: {
      paddingVertical: t.spacing.xl,
      paddingHorizontal: t.spacing.lg,
      alignItems: 'center',
    },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.sm,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: '600',
      color: t.colors.text,
    },
    emptyHint: {
      fontSize: 13,
      fontWeight: '500',
      color: t.colors.textTertiary,
      marginTop: 4,
    },
  });
}
