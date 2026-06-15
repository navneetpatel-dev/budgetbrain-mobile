import { useMemo } from 'react';
import { StyleSheet, View, RefreshControl, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import {
  Card,
  EmptyState,
  ListSkeleton,
  StickyHeaderFlatScreen,
  ProgressBar,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { Fab } from '@/features/navigation/components/Fab';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { Goal } from '@/shared/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { data: goals, total, isLoading, refetch, isRefetching } = usePaginatedList<Goal, 'goals'>({
    queryKey: ['goals'],
    url: '/goals',
    itemsKey: 'goals',
  });

  if (isLoading) {
    return <ListSkeleton count={3} />;
  }

  return (
    <View style={styles.root}>
      <StickyHeaderFlatScreen
        header={
          <ProfileStackHeader
            screen="goals"
            subtitle={`${total} active goal${total !== 1 ? 's' : ''}`}
            actionIcon="add"
            actionLabel="Create goal"
            onAction={() => router.push('/goal/add')}
          />
        }
        data={goals}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No goals yet"
            subtitle="Set a financial goal to stay motivated"
            icon="goals"
            action="Create goal"
            onAction={() => router.push('/goal/add')}
          />
        }
        renderItem={({ item }) => {
          const progress = Math.min(100, Math.round((Number(item.currentAmount) / Number(item.targetAmount)) * 100));

          return (
            <Card style={styles.goalCard}>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalType}>{item.type.replace('_', ' ')}</Text>
              <View style={styles.amountRow}>
                <Text style={styles.current}>{formatCurrency(Number(item.currentAmount), item.currency)}</Text>
                <Text style={styles.target}>/ {formatCurrency(Number(item.targetAmount), item.currency)}</Text>
              </View>
              <ProgressBar progress={progress} color={theme.colors.success} />
              <Text style={styles.progressText}>{progress}% complete</Text>
              <View style={styles.goalActions}>
                <Pressable
                  onPress={() => router.push(appHref(`/goal/${item.id}`))}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.name}`}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(appHref(`/goal/${item.id}/contribute`))}
                  accessibilityRole="button"
                  accessibilityLabel={`Contribute to ${item.name}`}
                >
                  <Text style={styles.contributeText}>+ Contribute</Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
      />
      <Fab href="/goal/add" aboveTabBar />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1 },
    goalCard: { marginBottom: 0 },
    goalName: { ...t.typography.titleSm, color: t.colors.text },
    goalType: { ...t.typography.caption, color: t.colors.textSecondary, textTransform: 'capitalize', marginBottom: 8 },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    current: { ...t.typography.amount, color: t.colors.primary },
    target: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginLeft: 4 },
    progressText: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 6 },
    goalActions: { flexDirection: 'row', gap: 16, marginTop: 12 },
    editText: { color: t.colors.textSecondary, fontWeight: '600', fontSize: 14 },
    contributeText: { color: t.colors.primary, fontWeight: '600', fontSize: 14 },
  });
}
