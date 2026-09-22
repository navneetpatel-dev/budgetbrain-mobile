import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { FilterChipItem } from '@/shared/components/ui';
import { useInfinitePaginatedList, usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions.hook';
import { useTheme } from '@/shared/theme';
import type { IncomeSource, Transaction } from '@/shared/types';
import {
  buildInitialFilters,
  countActiveFilters,
  DEFAULT_TRANSACTION_FILTERS,
  FILTER_PICKER_FETCH_LIMIT,
  toExpenseListParams,
  type TransactionListFilters,
  type TransactionTypeFilter,
  type DatePreset,
} from '@/features/expenses/utils/transactionFilters';

const LIST_PAGE_SIZE = 20;
const LIST_QUERY_KEY = ['transactions', 'all'] as const;

export function useExpensesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
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
    summary,
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

  // Cash Flow Hero metrics: server-computed SUM for the active filter set (`summary`),
  // never a client-side reduce over `transactions` — that only reflects loaded pages and
  // would silently undercount once a filter matches more than one page of results.
  const totalSpent = (summary as { totalExpense?: number } | undefined)?.totalExpense ?? 0;
  const totalEarned = (summary as { totalIncome?: number } | undefined)?.totalIncome ?? 0;
  const currentCurrency = useMemo(() => {
    return transactions[0]?.currency || 'INR';
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

  return {
    total,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    categories,
    sources,
    filters,
    draftFilters,
    setDraftFilters,
    filtersOpen,
    openFilters,
    closeFilters,
    applyFilters,
    clearFilters,
    searchQuery,
    setSearchQuery,
    activeFilterCount,
    totalSpent,
    totalEarned,
    currentCurrency,
    railChips,
    handleRailSelect,
    selectedRailId,
    filteredTransactions,
  };
}
