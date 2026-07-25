import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Card, ProgressBar } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import type { Goal } from '@/shared/types';

export function GoalCard({
  goal,
  onDelete,
}: {
  goal: Goal;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const progress = toSafePercent(goal.currentAmount, goal.targetAmount);
  const openGoal = () => router.push(appHref(`/goal/${goal.id}`));

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.titleCol}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <Text style={styles.goalType}>{goal.type.replace('_', ' ')}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={openGoal}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Open ${goal.name}`}
          >
            <AppIcon name="edit" size={18} color={theme.colors.textTertiary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${goal.name}`}
          >
            <AppIcon name="trash" size={18} color={theme.colors.danger} />
          </Pressable>
        </View>
      </View>
      <View style={styles.amountBlock}>
        <Text style={styles.current}>{formatCurrency(Number(goal.currentAmount), goal.currency)}</Text>
        <Text style={styles.target}>of {formatCurrency(Number(goal.targetAmount), goal.currency)}</Text>
      </View>
      <ProgressBar
        progress={progress}
        color={progress >= 100 ? theme.colors.success : theme.colors.primary}
      />
      <Text style={styles.progressText}>{progress}% achieved</Text>
    </Card>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    goalCard: { marginBottom: 0 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleCol: { flex: 1 },
    goalName: { ...t.typography.titleSm, color: t.colors.text },
    goalType: { ...t.typography.caption, color: t.colors.textSecondary, textTransform: 'capitalize', marginTop: 2 },
    actions: { flexDirection: 'row', gap: 12 },
    amountBlock: { marginBottom: 12 },
    current: { ...t.typography.amount, color: t.colors.primary },
    target: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2, fontWeight: '500' },
    progressText: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 6 },
  });
}
