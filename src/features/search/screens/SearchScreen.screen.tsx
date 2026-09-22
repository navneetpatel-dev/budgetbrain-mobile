import { useState, useMemo } from 'react';
import { Text, View, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { appHref } from '@/shared/utils/navigation';
import { AppHeaderBar, EmptyState, ListSkeleton, ListRowsSkeleton, FilterChipsRail, type FilterChipItem } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem.component';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import { useTheme } from '@/shared/theme';
import { useFabBottom } from '@/shared/hooks/useFabBottom.hook';
import type { Transaction } from '@/shared/types';
import { FieldLimits, ValidationMessages, maxLen } from '@/shared/validation/fieldLimits';
import { createStyles } from './SearchScreen.styles';

export function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

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

  // Filter results by transaction type if active
  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (filterType === 'all') return results;
    return results.filter((t) => t.type === filterType);
  }, [results, filterType]);

  const filterChips: FilterChipItem[] = [
    { id: 'all', label: 'All Results' },
    { id: 'expense', label: 'Expenses Only' },
    { id: 'income', label: 'Income Only' },
  ];

  return (
    <View style={styles.root}>
      <AppHeaderBar
        title="Search Ledger"
        subtitle={enabled ? `${total} result${total !== 1 ? 's' : ''} found` : 'Find by merchant, note, or category'}
        showBack
        onBack={() => router.back()}
      />

      {/* Floating Search Dock */}
      <View style={styles.searchDock}>
        <View style={styles.inputContainer}>
          <AppIcon name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={(v) => setQuery(v.slice(0, maxLen('search')))}
            placeholder="Search merchant, tag, or category..."
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.textInput}
            autoFocus
            maxLength={maxLen('search')}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
            >
              <AppIcon name="close" size={14} color={theme.colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>

        {enabled ? (
          <View style={styles.chipsRow}>
            <FilterChipsRail
              chips={filterChips}
              selectedId={filterType}
              onSelect={(id) => setFilterType(id as 'all' | 'expense' | 'income')}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={enabled && !searching ? filteredResults : []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: fabBottom + 40 }]}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          searching ? (
            <ListSkeleton count={6} variant="transaction" showHeader={false} safeAreaTop={false} />
          ) : query.trim().length < FieldLimits.search.min ? (
            <View style={styles.hintContainer}>
              <View style={styles.hintIconPod}>
                <AppIcon name="search" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.hintTitle}>Instant Ledger Lookup</Text>
              <Text style={styles.hintText}>{ValidationMessages.minChars(FieldLimits.search.min)}</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? <ListRowsSkeleton count={2} variant="transaction" /> : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          enabled && !searching ? (
            <EmptyState icon="search" title="No results found" subtitle="Try checking for typos or searching a different term" />
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
              showBadge
              isFirst
              isLast
            />
          </TransactionGroup>
        )}
      />
    </View>
  );
}

