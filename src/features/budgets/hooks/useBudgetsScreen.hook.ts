import { useMemo, useState } from 'react';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList.hook';
import type { FilterChipItem } from '@/shared/components/ui';
import type { Budget } from '@/shared/types';

export function useBudgetsScreen() {
  const [activeFilter, setActiveFilter] = useState('active');

  const { data: budgets, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Budget, 'budgets'>({
    queryKey: ['budgets'],
    url: '/budgets',
    itemsKey: 'budgets',
  });

  // NOTE: this aggregates each budget's own already-server-provided spent/amount fields
  // client-side into an overall consumption %. The backend has no single "overall budget
  // consumption" endpoint today — flagged in this step's status line as a candidate for a
  // dedicated server field rather than fixed here (pre-existing behavior, only relocated).
  const { totalSpent, totalLimit, overallProgress, currency } = useMemo(() => {
    let spent = 0;
    let limit = 0;
    let curr = 'INR';

    (budgets ?? []).forEach((b) => {
      curr = b.currency || curr;
      spent += b.spent ?? 0;
      limit += Number(b.effectiveAmount ?? b.amount) || 0;
    });

    const prog = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    return { totalSpent: spent, totalLimit: limit, overallProgress: prog, currency: curr };
  }, [budgets]);

  const periodChips: FilterChipItem[] = [
    { id: 'active', label: `Active (${total || 0})` },
    { id: 'custom', label: 'Custom' },
    { id: 'archived', label: 'Archived' },
  ];

  const dailySafe = totalLimit > totalSpent ? (totalLimit - totalSpent) / 30 : 0;

  return {
    budgets,
    isLoading,
    isError,
    refetch,
    isRefetching,
    activeFilter,
    setActiveFilter,
    totalSpent,
    totalLimit,
    overallProgress,
    currency,
    periodChips,
    dailySafe,
  };
}
