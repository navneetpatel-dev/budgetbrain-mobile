import { useMemo, useState } from 'react';
import type { FilterChipItem } from '@/shared/components/ui';
import { useInfinitePaginatedList, usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import type { IncomeSource, Transaction } from '@/shared/types';

export function useIncomeScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const {
    items: transactions,
    total: transactionTotal,
    isLoading,
    isError,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePaginatedList<Transaction>({
    queryKey: ['income'],
    url: '/income',
    itemsKey: 'transactions',
    pageSize: 20,
  });

  const { data: sources, refetch: refetchSources } = usePaginatedList<IncomeSource, 'sources'>({
    queryKey: ['income-sources'],
    url: '/income/sources',
    itemsKey: 'sources',
  });

  const sourceCount = sources?.length ?? 0;

  // Calculate total monthly income
  const { totalEarned, currency } = useMemo(() => {
    let sum = 0;
    let curr = 'INR';
    (transactions ?? []).forEach((t) => {
      curr = t.currency || curr;
      sum += Number(t.amount) || 0;
    });
    return { totalEarned: sum, currency: curr };
  }, [transactions]);

  // Dynamic filter chips from sources
  const filterChips: FilterChipItem[] = useMemo(() => {
    const chips: FilterChipItem[] = [
      { id: 'all', label: `All (${transactionTotal || 0})` },
    ];
    (sources ?? []).forEach((s) => {
      chips.push({ id: s.id, label: s.name });
    });
    return chips;
  }, [sources, transactionTotal]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (activeCategory === 'all') return transactions;
    return transactions.filter(
      (t) =>
        t.incomeSourceId === activeCategory ||
        t.category?.id === activeCategory ||
        t.category?.name === activeCategory,
    );
  }, [transactions, activeCategory]);

  const refreshAll = () => {
    refetch();
    refetchSources();
  };

  return {
    transactionTotal,
    isLoading,
    isError,
    isRefetching,
    refetch,
    refreshAll,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    sources,
    sourceCount,
    totalEarned,
    currency,
    filterChips,
    activeCategory,
    setActiveCategory,
    filteredTransactions,
  };
}
