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
  const effectiveLimit = budget.effectiveAmount ?? budget.amount;
  const rolloverAmount = budget.rolloverAmount ?? 0;
  const progress = toSafePercent(spent, effectiveLimit);
  const overBudget = toSafeNumber(spent) > toSafeNumber(effectiveLimit);
  const fillColor = overBudget
    ? theme.colors.danger
    : progress >= budget.alertThreshold
      ? theme.colors.warning
      : theme.colors.primary;

  const goToEdit = () => router.push(appHref(`/budget/${budget.id}?edit=1`));

  return (
    <Card style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <View style={styles.titleCol}>
          <Text style={styles.budgetName}>{budget.name}</Text>
          <Text style={styles.budgetType}>
            {`${budget.type.charAt(0).toUpperCase()}${budget.type.slice(1)}${budget.category?.name ? ` · ${budget.category.name}` : ''}`}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={goToEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${budget.name}`}
          >
            <AppIcon name="edit" size={18} color={theme.colors.textTertiary} />
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
        <Text style={styles.budgetLimit}>/ {formatCurrency(Number(effectiveLimit), budget.currency)}</Text>
      </Text>
      <ProgressBar progress={progress} color={fillColor} style={{ marginTop: 12 }} />
      <Text style={styles.alertText}>{progress}% used · alerts at {budget.alertThreshold}%</Text>
      {budget.rollover && rolloverAmount !== 0 ? (
        <Text style={styles.alertText}>
          {rolloverAmount > 0 ? '+' : ''}{formatCurrency(rolloverAmount, budget.currency)} rolled over from last period
        </Text>
      ) : null}
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
    alertText: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 8 },
  });
}
