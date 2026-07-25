import { useState, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { Input, StackNavHeader, StickyHeaderFlatScreen, EmptyState, ListSkeleton, ListRowsSkeleton } from '@/shared/components/ui';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useTheme } from '@/shared/theme';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import type { Transaction } from '@/shared/types';
import { FieldLimits, ValidationMessages, maxLen } from '@/shared/validation/fieldLimits';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');

  const enabled = query.trim().length >= FieldLimits.search.min;
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
              onChangeText={(v) => setQuery(v.slice(0, maxLen('search')))}
              placeholder="Type to search..."
              autoFocus
              leftIcon="search"
              maxLength={maxLen('search')}
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
          <ListSkeleton count={6} variant="transaction" showHeader={false} safeAreaTop={false} />
        ) : query.trim().length < FieldLimits.search.min ? (
          <Text style={styles.hint}>{ValidationMessages.minChars(FieldLimits.search.min)}</Text>
        ) : null
      }
      ListFooterComponent={
        isFetchingNextPage ? <ListRowsSkeleton count={2} variant="transaction" /> : null
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    hint: { textAlign: 'center', color: t.colors.textSecondary, marginTop: 32, fontSize: 14 },
  });
}
