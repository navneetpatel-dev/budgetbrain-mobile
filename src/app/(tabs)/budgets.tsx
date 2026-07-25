import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import {
  EmptyState,
  ListSkeleton,
  FeatureHeader,
  StickyHeaderFlatScreen,
  useStackBack,
} from '@/shared/components/ui';
import { BudgetCard } from '@/features/budgets/components/BudgetCard';
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget';
import { confirmDeleteBudget } from '@/features/budgets/services/confirmations';
import { showAlert } from '@/shared/utils/confirmations';
import { useTheme } from '@/shared/theme';
import type { Budget } from '@/shared/types';

export default function BudgetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/(tabs)' as Href);
  const { deleteBudget } = useDeleteBudget();

  const { data: budgets, total, isLoading, refetch, isRefetching } = usePaginatedList<Budget, 'budgets'>({
    queryKey: ['budgets'],
    url: '/budgets',
    itemsKey: 'budgets',
  });

  if (isLoading) return <ListSkeleton count={4} variant="budget" />;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="PLAN"
          title="Budgets"
          subtitle={`${total} active`}
          actionIcon="add"
          actionLabel="Create budget"
          onAction={() => router.push('/budget/add')}
        />
      }
      data={budgets}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
      ListEmptyComponent={
        <EmptyState
          icon="budgets"
          title="No budgets yet"
          subtitle="Set spending limits to stay on track"
          action="Create budget"
          onAction={() => router.push('/budget/add')}
        />
      }
      renderItem={({ item }) => (
        <BudgetCard
          budget={item}
          onDelete={() =>
            confirmDeleteBudget(item.name, () =>
              deleteBudget(item.id).catch(() => showAlert('Error', 'Could not delete budget')),
            )
          }
        />
      )}
    />
  );
}
