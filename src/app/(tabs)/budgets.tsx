import { Alert, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { apiGet } from '@/shared/services/api';
import {
  EmptyState,
  ScreenLoader,
  FeatureHeader,
  StickyHeaderFlatScreen,
} from '@/shared/components/ui';
import { BudgetCard } from '@/features/budgets/components/BudgetCard';
import { useDeleteBudget } from '@/features/budgets/hooks/useDeleteBudget';
import { confirmDeleteBudget } from '@/features/budgets/services/confirmations';
import { useTheme } from '@/shared/theme';
import type { Budget, Transaction } from '@/shared/types';

export default function BudgetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { deleteBudget } = useDeleteBudget();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiGet<Budget[]>('/budgets'),
  });

  const { data: expenseData } = useQuery({
    queryKey: ['transactions', 'expense', 'budgets'],
    queryFn: () => apiGet<{ transactions: Transaction[] }>('/expenses', { type: 'expense', limit: 500 }),
  });

  if (isLoading) return <ScreenLoader />;

  const budgets = data ?? [];
  const count = budgets.length;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          eyebrow="PLAN"
          title="Budgets"
          subtitle={`${count} active`}
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
          expenses={expenseData?.transactions ?? []}
          onDelete={() =>
            confirmDeleteBudget(item.name, () =>
              deleteBudget(item.id).catch(() => Alert.alert('Error', 'Could not delete budget')),
            )
          }
        />
      )}
    />
  );
}
