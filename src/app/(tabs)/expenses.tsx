import { RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import {
  EmptyState,
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
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePaginatedList<Transaction>({
    queryKey: ['transactions', 'all'],
    url: '/expenses',
    itemsKey: 'transactions',
    pageSize: 20,
  });

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="Track"
          title="Activity"
          subtitle={isLoading ? 'Loading…' : `${total} transaction${total !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Add expense"
          onAction={() => router.push('/expense/add')}
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
      data={isLoading ? [] : transactions}
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
        isLoading ? (
          <ListRowsSkeleton count={6} variant="transaction" />
        ) : isError ? (
          <EmptyState
            icon="activity"
            title="Couldn’t load activity"
            subtitle="Check your connection and try again"
            action="Retry"
            onAction={() => void refetch()}
          />
        ) : (
          <EmptyState
            icon="activity"
            title="No transactions yet"
            subtitle="Your income and spending history will appear here"
            action="Add expense"
            onAction={() => router.push('/expense/add')}
          />
        )
      }
      renderItem={({ item }) => (
        <TransactionGroup>
          <TransactionItem
            transaction={item}
            onPress={() =>
              router.push(
                appHref(item.type === 'income' ? `/income/${item.id}` : `/expense/${item.id}`),
              )
            }
            isFirst
            isLast
          />
        </TransactionGroup>
      )}
    />
  );
}
