import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/src/shared/utils/navigation';
import { Card, ProgressBar } from '@/src/shared/components/ui';
import { AppIcon } from '@/src/features/navigation/components/AppIcon';
import { useTheme } from '@/src/shared/theme';
import { formatCurrency } from '@/src/shared/utils/currency';
import type { Budget, Transaction } from '@/src/shared/types';

export function getBudgetDateRange(budget: Budget): { startDate: string; endDate: string } {
  const now = new Date();
  if (budget.type === 'weekly') {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: budget.startDate ?? start.toISOString().split('T')[0],
    endDate: budget.endDate ?? end.toISOString().split('T')[0],
  };
}

export function getBudgetSpent(budget: Budget, expenses: Transaction[]): number {
  const { startDate, endDate } = getBudgetDateRange(budget);
  return expenses
    .filter((e) => {
      const inRange = e.date >= startDate && e.date <= endDate;
      const matchesCategory = budget.type !== 'category' || e.categoryId === budget.categoryId;
      return inRange && matchesCategory;
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);
}

export function BudgetCard({
  budget,
  expenses,
  onDelete,
}: {
  budget: Budget;
  expenses: Transaction[];
  onDelete: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const spent = useMemo(() => getBudgetSpent(budget, expenses), [expenses, budget]);

  const progress = Math.min(100, Math.round((spent / Number(budget.amount)) * 100));
  const overBudget = spent > Number(budget.amount);
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
