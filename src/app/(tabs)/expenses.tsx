import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  EmptyState,
  ListSkeleton,
  ListRowsSkeleton,
  FeatureHeader,
  SearchField,
  HeaderIconButton,
  StickyHeaderFlatScreen,
  useStackBack,
} from '@/shared/components/ui';
import type { Href } from 'expo-router';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import type { Transaction } from '@/shared/types';

export default function ExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const goBack = useStackBack('/(tabs)' as Href);

  const {
    items: transactions,
    total,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePaginatedList<Transaction>({
    queryKey: ['transactions', 'expense'],
    url: '/expenses',
    itemsKey: 'transactions',
    params: { type: 'expense' },
    pageSize: 20,
  });

  if (isLoading) return <ListSkeleton count={6} variant="transaction" />;

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
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
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isFetchingNextPage ? <ListRowsSkeleton count={2} variant="transaction" /> : null
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
