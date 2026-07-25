import { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { appHref } from '@/shared/utils/navigation';
import { TransactionItem, TransactionGroup } from '@/features/expenses/components/TransactionItem';
import { TransactionFilters } from '@/features/expenses/components/TransactionFilters';
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
  const goBack = useStackBack('/(tabs)' as Href);
  const routeParams = useLocalSearchParams<{
    type?: string;
    categoryId?: string;
    incomeSourceId?: string;
    paymentMethod?: string;
    datePreset?: string;
    startDate?: string;
    endDate?: string;
  }>();

  // Applied filters drive the list query immediately (route sync is secondary).
  const [filters, setFilters] = useState<TransactionListFilters>(() =>
    buildInitialFilters(routeParams),
  );
  // Draft edits while the panel is open; list uses applied `filters` until Apply.
  const [draftFilters, setDraftFilters] = useState<TransactionListFilters>(() =>
    buildInitialFilters(routeParams),
  );
  // Always start collapsed; active state is shown on the filter button badge.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Skip one route→state sync after local Apply/Clear (avoids overwriting with stale params).
  const skipNextRouteSync = useRef(false);

  const commitRouteParams = useCallback(
    (next: TransactionListFilters) => {
      // Expo Router often ignores `undefined` and keeps old params — use '' to clear.
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
    // Already cleared: close panel only — do not refetch.
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

    // Default list is often still fresh (2m staleTime) from the initial load.
    // Reset that cache so Clear always hits the API with the default payload.
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
            <View style={{ gap: 6 }}>
              <SearchField
                placeholder="Search transactions"
                onPress={() => router.push('/search')}
                rightAction={
                  <HeaderIconButton
                    icon="filter"
                    label={activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
                    badge={activeFilterCount}
                    onPress={() => (filtersOpen ? closeFilters() : openFilters())}
                  />
                }
              />
              {filtersOpen ? (
                <TransactionFilters
                  filters={draftFilters}
                  onChange={setDraftFilters}
                  onApply={applyFilters}
                  onClear={clearFilters}
                  categories={categories}
                  sources={sources}
                />
              ) : null}
            </View>
          }
        />
      }
      data={isLoading ? [] : transactions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={filtersOpen ? { paddingTop: 4 } : undefined}
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
      renderItem={({ item }) => (
        <TransactionGroup>
          <TransactionItem
            transaction={item}
            showBadge
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
