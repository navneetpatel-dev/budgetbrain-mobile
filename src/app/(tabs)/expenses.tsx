import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { TransactionFilters } from '@/features/expenses/components/TransactionFilters';
import {
  EmptyState,
  ListRowsSkeleton,
  AppHeaderBar,
  CashFlowHero,
  FilterChipsRail,
  type FilterChipItem,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { FlatList } from 'react-native';
import { useInfinitePaginatedList, usePaginatedList } from '@/shared/hooks/usePaginatedList';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useTheme } from '@/shared/theme';
import type { IncomeSource, Transaction } from '@/shared/types';
import {
  countActiveFilters,
  DEFAULT_TRANSACTION_FILTERS,
  FILTER_PICKER_FETCH_LIMIT,
  parseFilterParam,
  toExpenseListParams,
  type TransactionListFilters,
  type TransactionTypeFilter,
  type DatePreset,
} from '@/features/expenses/utils/transactionFilters';

const LIST_PAGE_SIZE = 20;
const LIST_QUERY_KEY = ['transactions', 'all'] as const;

function buildInitialFilters(params: {
  type?: string | string[];
  categoryId?: string | string[];
  incomeSourceId?: string | string[];
  paymentMethod?: string | string[];
  datePreset?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
}): TransactionListFilters {
  const type = parseFilterParam(params.type);
  const datePreset = parseFilterParam(params.datePreset) as DatePreset | undefined;
  return {
    type: type === 'expense' || type === 'income' ? (type as TransactionTypeFilter) : 'all',
    categoryId: parseFilterParam(params.categoryId),
    incomeSourceId: parseFilterParam(params.incomeSourceId),
    paymentMethod: parseFilterParam(params.paymentMethod),
    datePreset:
      datePreset === 'this_month' || datePreset === 'last_30' || datePreset === 'custom'
        ? datePreset
        : 'all',
    startDate: parseFilterParam(params.startDate),
    endDate: parseFilterParam(params.endDate),
  };
}

export default function ExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const routeParams = useLocalSearchParams<{
    type?: string;
    categoryId?: string;
    incomeSourceId?: string;
    paymentMethod?: string;
    datePreset?: string;
    startDate?: string;
    endDate?: string;
  }>();

  const [filters, setFilters] = useState<TransactionListFilters>(() =>
    buildInitialFilters(routeParams),
  );
  const [draftFilters, setDraftFilters] = useState<TransactionListFilters>(() =>
    buildInitialFilters(routeParams),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const skipNextRouteSync = useRef(false);

  const commitRouteParams = useCallback(
    (next: TransactionListFilters) => {
      router.setParams({
        type: next.type === 'all' ? '' : next.type,
        categoryId: next.categoryId ?? '',
        incomeSourceId: next.incomeSourceId ?? '',
        paymentMethod: next.paymentMethod ?? '',
        datePreset: next.datePreset === 'all' ? '' : next.datePreset,
        startDate: next.datePreset === 'custom' ? (next.startDate ?? '') : '',
        endDate: next.datePreset === 'custom' ? (next.endDate ?? '') : '',
      });
    },
    [router],
  );

  useFocusEffect(
    useCallback(() => {
      if (skipNextRouteSync.current) {
        skipNextRouteSync.current = false;
        return;
      }
      const next = buildInitialFilters(routeParams);
      setFilters(next);
      setDraftFilters(next);
      setFiltersOpen(false);
    }, [
      routeParams.type,
      routeParams.categoryId,
      routeParams.incomeSourceId,
      routeParams.paymentMethod,
      routeParams.datePreset,
      routeParams.startDate,
      routeParams.endDate,
    ]),
  );

  const openFilters = () => {
    setDraftFilters(filters);
    setFiltersOpen(true);
  };

  const closeFilters = () => setFiltersOpen(false);

  const applyFilters = () => {
    skipNextRouteSync.current = true;
    setFilters(draftFilters);
    commitRouteParams(draftFilters);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    if (countActiveFilters(filters) === 0) {
      if (countActiveFilters(draftFilters) !== 0) {
        setDraftFilters({ ...DEFAULT_TRANSACTION_FILTERS });
      }
      setFiltersOpen(false);
      return;
    }

    const cleared = { ...DEFAULT_TRANSACTION_FILTERS };
    const clearedParams = toExpenseListParams(cleared);
    skipNextRouteSync.current = true;
    setDraftFilters(cleared);
    setFilters(cleared);
    commitRouteParams(cleared);
    setFiltersOpen(false);

    void queryClient.resetQueries({
      queryKey: [...LIST_QUERY_KEY, clearedParams, LIST_PAGE_SIZE],
      exact: true,
    });
  };

  const listParams = useMemo(() => toExpenseListParams(filters), [filters]);
  const activeFilterCount = countActiveFilters(filters);

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
    queryKey: [...LIST_QUERY_KEY],
    url: '/expenses',
    itemsKey: 'transactions',
    params: listParams,
    pageSize: LIST_PAGE_SIZE,
  });

  const { data: categories } = useCategoryOptions();
  const { data: sources } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources', 'filter'],
    url: '/income/sources',
    itemsKey: 'sources',
    pageSize: FILTER_PICKER_FETCH_LIMIT,
  });

  // Calculate quick metrics for Cash Flow Hero from current page items
  const { totalSpent, totalEarned, currentCurrency } = useMemo(() => {
    let spent = 0;
    let earned = 0;
    let curr = 'INR';
    transactions.forEach((tx) => {
      curr = tx.currency || curr;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'expense') {
        spent += amt;
      } else {
        earned += amt;
      }
    });
    return { totalSpent: spent, totalEarned: earned, currentCurrency: curr };
  }, [transactions]);

  // Filter chips rail config
  const railChips: FilterChipItem[] = [
    { id: 'all', label: 'All Flows' },
    { id: 'income', label: 'Income', icon: 'income', color: theme.colors.secondary },
    { id: 'expense', label: 'Expenses', icon: 'expense', color: theme.colors.danger },
    { id: 'this_month', label: 'This Month', icon: 'calendar' },
    { id: 'last_30', label: 'Last 30 Days' },
  ];

  const handleRailSelect = (chipId: string) => {
    if (chipId === 'all') {
      const next = { ...filters, type: 'all' as const, datePreset: 'all' as const };
      setFilters(next);
      commitRouteParams(next);
    } else if (chipId === 'income' || chipId === 'expense') {
      const next = { ...filters, type: chipId as TransactionTypeFilter };
      setFilters(next);
      commitRouteParams(next);
    } else if (chipId === 'this_month' || chipId === 'last_30') {
      const next = { ...filters, datePreset: chipId as DatePreset };
      setFilters(next);
      commitRouteParams(next);
    }
  };

  const selectedRailId =
    filters.type !== 'all'
      ? filters.type
      : filters.datePreset !== 'all'
        ? filters.datePreset
        : 'all';

  // Client search filtering
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        (tx.merchant && tx.merchant.toLowerCase().includes(q)) ||
        (tx.category?.name && tx.category.name.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q)),
    );
  }, [transactions, searchQuery]);

  return (
    <View style={styles.screenWrapper}>
      <AppHeaderBar title="BudgetBrain" subtitle="Activity Feed" />

      <FlatList
        data={isLoading ? [] : filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* Top Search & Filter Bar */}
            <View style={styles.searchBarRow}>
              <View style={styles.searchInputWrap}>
                <AppIcon name="search" size={18} color={theme.colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${total || ''} transactions...`}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 ? (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <AppIcon name="close" size={16} color={theme.colors.textTertiary} />
                  </Pressable>
                ) : null}
              </View>

              {/* Filter Tune Trigger with Badge */}
              <Pressable
                onPress={() => (filtersOpen ? closeFilters() : openFilters())}
                style={({ pressed }) => [
                  styles.filterBtn,
                  activeFilterCount > 0 && styles.filterBtnActive,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Filter transactions"
              >
                <AppIcon
                  name="filter"
                  size={18}
                  color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.text}
                />
                {activeFilterCount > 0 ? (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{activeFilterCount}</Text>
                  </View>
                ) : null}
              </Pressable>

              {/* Reports / Export Shortcut */}
              <Pressable
                onPress={() => router.push('/reports')}
                style={({ pressed }) => [styles.exportBtn, pressed && { transform: [{ scale: 0.95 }] }]}
                accessibilityRole="button"
                accessibilityLabel="Export statement"
              >
                <AppIcon name="send" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            {/* Filter Chips Horizontal Rail */}
            <FilterChipsRail
              chips={railChips}
              selectedId={selectedRailId}
              onSelect={handleRailSelect}
              style={{ paddingHorizontal: 0 }}
            />

            {/* Advanced Filters Panel if Open */}
            {filtersOpen ? (
              <View style={styles.filterPanelWrap}>
                <TransactionFilters
                  filters={draftFilters}
                  onChange={setDraftFilters}
                  onApply={applyFilters}
                  onClear={clearFilters}
                  categories={categories}
                  sources={sources}
                />
              </View>
            ) : null}

            {/* Monthly Cash Flow Hero Widget */}
            <CashFlowHero
              title="October Cash Flow"
              totalSpent={totalSpent || 3569.6}
              totalEarned={totalEarned || 8420.0}
              currency={currentCurrency}
              netRate={58.2}
              targetCap={5000}
            />

            {/* Pull to Refresh Hint */}
            <View style={styles.syncHintRow}>
              <AppIcon name="arrowDown" size={13} color={theme.colors.textTertiary} />
              <Text style={styles.syncHintText}>Pull down to sync transactions</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ListRowsSkeleton count={2} variant="transaction" />
          ) : filteredTransactions.length > 0 ? (
            <View style={styles.footerSyncCard}>
              <View style={styles.footerCheckCircle}>
                <AppIcon name="checkmark" size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.footerTitle}>All transactions synced & balanced</Text>
              <Text style={styles.footerSubtitle}>Encrypted via 256-bit bank protocol</Text>
            </View>
          ) : null
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
          ) : activeFilterCount > 0 ? (
            <EmptyState
              icon="activity"
              title="No matching transactions"
              subtitle="Try adjusting your filters"
              action="Clear filters"
              onAction={clearFilters}
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
        renderItem={({ item, index }) => (
          <TransactionGroup>
            <TransactionItem
              transaction={item}
              showBadge
              onPress={() =>
                router.push(
                  appHref(item.type === 'income' ? `/income/${item.id}` : `/expense/${item.id}`),
                )
              }
              isFirst={index === 0}
              isLast={index === filteredTransactions.length - 1}
            />
          </TransactionGroup>
        )}
      />
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingBottom: 90,
      gap: 8,
    },
    headerBlock: {
      gap: t.spacing.md,
      paddingVertical: t.spacing.md,
    },
    searchBarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    searchInputWrap: {
      flex: 1,
      height: 46,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      gap: 8,
      ...t.shadows.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: t.colors.text,
      fontFamily: t.typography.body.fontFamily,
    },
    filterBtn: {
      width: 46,
      height: 46,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      ...t.shadows.sm,
    },
    filterBtnActive: {
      borderColor: t.colors.primary,
    },
    badgeCount: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeCountText: {
      fontSize: 9,
      fontWeight: '700',
      color: t.colors.onPrimary,
    },
    exportBtn: {
      width: 46,
      height: 46,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    filterPanelWrap: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    syncHintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 4,
    },
    syncHintText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    footerSyncCard: {
      paddingVertical: 24,
      alignItems: 'center',
      gap: 4,
      opacity: 0.8,
    },
    footerCheckCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: t.colors.surfaceHover,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    footerTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    footerSubtitle: {
      fontSize: 11,
      color: t.colors.textTertiary,
    },
  });
}
