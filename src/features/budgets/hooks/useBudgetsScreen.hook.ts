import { useMemo, useState } from 'react';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import type { FilterChipItem } from '@/shared/components/ui';
import type { Budget } from '@/shared/types';

export function useBudgetsScreen() {
  const [activeFilter, setActiveFilter] = useState('active');
  const [sortBySpent, setSortBySpent] = useState(false);

  const { data: rawBudgets, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Budget, 'budgets'>({
    queryKey: ['budgets'],
    url: '/budgets',
    itemsKey: 'budgets',
  });

  const daysRemaining = useMemo(() => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.max(1, endOfMonth.getDate() - now.getDate());
  }, []);

  const budgets = useMemo(() => {
    if (!rawBudgets) return [];
    if (!sortBySpent) return rawBudgets;
    return [...rawBudgets].sort((a, b) => (b.spent ?? 0) - (a.spent ?? 0));
  }, [rawBudgets, sortBySpent]);

  // NOTE: this aggregates each budget's own already-server-provided spent/amount fields
  // client-side into an overall consumption %. The backend has no single "overall budget
  // consumption" endpoint today — flagged in this step's status line as a candidate for a
  // dedicated server field rather than fixed here (pre-existing behavior, only relocated).
  const { totalSpent, totalLimit, overallProgress, currency } = useMemo(() => {
    let spent = 0;
    let limit = 0;
    let curr = 'INR';

    (rawBudgets ?? []).forEach((b) => {
      curr = b.currency || curr;
      spent += b.spent ?? 0;
      limit += Number(b.effectiveAmount ?? b.amount) || 0;
    });

    const prog = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    return { totalSpent: spent, totalLimit: limit, overallProgress: prog, currency: curr };
  }, [rawBudgets]);

  const periodChips: FilterChipItem[] = [
    { id: 'active', label: `Active (${total || 0})` },
    { id: 'custom', label: 'Custom' },
    { id: 'archived', label: 'Archived' },
  ];

  const dailySafe = totalLimit > totalSpent ? (totalLimit - totalSpent) / 30 : 0;

  const toggleSortBySpent = () => setSortBySpent((prev) => !prev);

  return {
    budgets,
    isLoading,
    isError,
    refetch,
    isRefetching,
    activeFilter,
    setActiveFilter,
    sortBySpent,
    toggleSortBySpent,
    daysRemaining,
    totalSpent,
    totalLimit,
    overallProgress,
    currency,
    periodChips,
    dailySafe,
  };
}
