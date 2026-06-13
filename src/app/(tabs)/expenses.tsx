import { RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { apiGet } from '@/shared/services/api';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  EmptyState,
  ScreenLoader,
  FeatureHeader,
  SearchField,
  HeaderIconButton,
  StickyHeaderFlatScreen,
} from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import type { Transaction } from '@/shared/types';

export default function ExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', 'expense'],
    queryFn: () =>
      apiGet<{ transactions: Transaction[]; total: number }>('/expenses', { type: 'expense', limit: 50 }),
  });

  if (isLoading) return <ScreenLoader />;

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? transactions.length;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          eyebrow="TRACK"
          title="Activity"
          subtitle={`${total} transaction${total !== 1 ? 's' : ''}`}
          footer={
            <SearchField
              placeholder="Search transactions"
              onPress={() => router.push('/search')}
              rightAction={
                <HeaderIconButton
                  icon="income"
                  label="Add income"
                  onPress={() => router.push('/income/add')}
                />
              }
            />
          }
        />
      }
      data={transactions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
      ListEmptyComponent={
        <EmptyState
          icon="activity"
          title="No expenses yet"
          subtitle="Your spending history will appear here"
          action="Add expense"
          onAction={() => router.push('/expense/add')}
        />
      }
      renderItem={({ item }) => (
        <TransactionGroup>
          <TransactionItem
            transaction={item}
            onPress={() => router.push(appHref(`/expense/${item.id}`))}
            isFirst
            isLast
          />
        </TransactionGroup>
      )}
    />
  );
}
