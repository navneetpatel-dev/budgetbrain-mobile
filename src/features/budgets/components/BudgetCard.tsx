import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Card, ProgressBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent, toSafeNumber } from '@/shared/utils/number';
import type { Budget } from '@/shared/types';

export function BudgetCard({
  budget,
  onDelete,
}: {
  budget: Budget;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const spent = budget.spent ?? 0;
  const progress = toSafePercent(spent, budget.amount);
  const overBudget = toSafeNumber(spent) > toSafeNumber(budget.amount);
  const fillColor = overBudget
    ? theme.colors.danger
    : progress >= budget.alertThreshold
      ? theme.colors.warning
      : theme.colors.primary;

  return (
    <Card variant="elevated" style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <View style={styles.titleCol}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Text style={styles.budgetType}>{budget.type}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push(appHref(`/budget/${budget.id}`))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${budget.name}`}
          >
            <AppIcon name="settings" size={18} color={theme.colors.textTertiary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${budget.name}`}
          >
            <AppIcon name="trash" size={18} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.budgetAmount}>
        {formatCurrency(spent, budget.currency)}{' '}
        <Text style={styles.budgetLimit}>/ {formatCurrency(Number(budget.amount), budget.currency)}</Text>
      </Text>
      {budget.category && <Text style={styles.category}>{budget.category.name}</Text>}
      <ProgressBar progress={progress} color={fillColor} style={{ marginTop: 12 }} />
      <Text style={styles.alertText}>{progress}% used · alerts at {budget.alertThreshold}%</Text>
    </Card>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    budgetCard: { marginBottom: 0 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleCol: { flex: 1 },
    budgetName: { ...t.typography.titleSm, color: t.colors.text },
    budgetType: { ...t.typography.caption, color: t.colors.textTertiary, textTransform: 'capitalize', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 12 },
    budgetAmount: { ...t.typography.amount, color: t.colors.text },
    budgetLimit: { ...t.typography.bodyMedium, color: t.colors.textSecondary, fontWeight: '500' },
    category: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
    alertText: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 8 },
  });
}
