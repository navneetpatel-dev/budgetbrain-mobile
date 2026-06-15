import { useState, useMemo } from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Input, StackNavHeader, StickyHeaderFlatScreen, EmptyState, ListSkeleton } from '@/shared/components/ui';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import type { Transaction } from '@/shared/types';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');

  const enabled = query.length >= 2;
  const {
    items: results,
    total,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    fetchNextPage,
    hasNextPage,
  } = useInfinitePaginatedList<Transaction>({
    queryKey: ['search', query],
    url: '/expenses/search',
    itemsKey: 'transactions',
    params: { q: query },
    pageSize: 20,
    enabled,
  });

  const searching = isLoading || isRefetching;

  return (
    <StickyHeaderFlatScreen
      inset="stack"
      header={
        <StackNavHeader
          title="Search"
          subtitle={enabled ? `${total} result${total !== 1 ? 's' : ''}` : 'Merchant, notes, or category'}
          footer={
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Type to search..."
              autoFocus
              leftIcon="search"
            />
          }
        />
      }
      data={enabled && !searching ? results : []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: fabBottom }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        searching ? (
          <ListSkeleton count={6} />
        ) : query.length < 2 ? (
          <Text style={styles.hint}>Type at least 2 characters to search</Text>
        ) : null
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
        ) : null
      }
      ListEmptyComponent={
        enabled && !searching ? (
          <EmptyState icon="search" title="No results" subtitle="Try a different search term" />
        ) : null
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    loader: { marginTop: 32 },
    hint: { textAlign: 'center', color: t.colors.textSecondary, marginTop: 32, fontSize: 14 },
  });
}
