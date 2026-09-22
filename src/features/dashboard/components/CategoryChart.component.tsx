import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { SegmentedMacroBar } from '@/shared/components/ui/SegmentedMacroBar.component';
import { useTheme } from '@/shared/theme';
import { buildCategoryChartItems, type CategoryChartInput } from '@/shared/utils/categoryChart';
import { createStyles } from './CategoryChart.styles';

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
