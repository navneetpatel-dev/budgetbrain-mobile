import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import {
  EmptyState,
  ListRowsSkeleton,
  FeatureHeader,
  StickyHeaderFlatScreen,
  useStackBack,
} from '@/shared/components/ui';
import { GoalCard } from '@/features/goals/components/GoalCard';
import { useDeleteGoal } from '@/features/goals/hooks/useDeleteGoal';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showAlert, showConfirmation } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import type { Goal } from '@/shared/types';

export default function GoalsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/(tabs)' as Href);
  const { deleteGoal } = useDeleteGoal();
  const { data: goals, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Goal, 'goals'>({
    queryKey: ['goals'],
    url: '/goals',
    itemsKey: 'goals',
  });

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="Save"
          title="Goals"
          subtitle={isLoading ? 'Loading…' : `${total} active goal${total !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Create goal"
          onAction={() => router.push('/goal/add')}
        />
      }
      data={isLoading ? [] : goals}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={3} variant="goal" />
        ) : isError ? (
          <EmptyState
            title="Couldn’t load goals"
            subtitle="Check your connection and try again"
            icon="goals"
            action="Retry"
            onAction={() => void refetch()}
          />
        ) : (
          <EmptyState
            title="No goals yet"
            subtitle="Set a financial goal to stay motivated"
            icon="goals"
            action="Create goal"
            onAction={() => router.push('/goal/add')}
          />
        )
      }
      renderItem={({ item }) => (
        <GoalCard
          goal={item}
          onDelete={() =>
            showConfirmation(CONFIRM.deleteGoal, () =>
              deleteGoal(item.id).catch(() => showAlert('Error', 'Could not delete goal')),
            )
          }
        />
      )}
    />
  );
}
