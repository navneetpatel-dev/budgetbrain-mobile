import { useMemo, useState } from 'react';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { FilterChipItem } from '@/shared/components/ui';
import type { Goal } from '@/shared/types';

export function useGoalsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'achieved'>('all');

  const { data: goals, total, isLoading, isError, refetch, isRefetching } = usePaginatedList<Goal, 'goals'>({
    queryKey: ['goals'],
    url: '/goals',
    itemsKey: 'goals',
  });

  // Cumulative saved/target amounts are a client-side sum of each goal's own
  // server-provided currentAmount/targetAmount (not a re-derivation of any single
  // goal's own percentage — that comes from goal.progressPercentage, per step 12).
  const { totalSaved, totalTarget, overallProgress, currency, activeCount, achievedCount } = useMemo(() => {
    let saved = 0;
    let target = 0;
    let curr = 'INR';
    let active = 0;
    let achieved = 0;

    (goals ?? []).forEach((g) => {
      curr = g.currency || curr;
      saved += Number(g.currentAmount) || 0;
      target += Number(g.targetAmount) || 0;
      if (g.completedAt != null) {
        achieved += 1;
      } else {
        active += 1;
      }
    });

    const prog = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return {
      totalSaved: saved,
      totalTarget: target,
      overallProgress: prog,
      currency: curr,
      activeCount: active,
      achievedCount: achieved,
    };
  }, [goals]);

  // Filtered goals based on selection — achievement uses the server-computed completedAt,
  // not a client-side currentAmount/targetAmount comparison.
  const filteredGoals = useMemo(() => {
    if (!goals) return [];
    if (activeFilter === 'active') {
      return goals.filter((g) => g.completedAt == null);
    }
    if (activeFilter === 'achieved') {
      return goals.filter((g) => g.completedAt != null);
    }
    return goals;
  }, [goals, activeFilter]);

  const filterChips: FilterChipItem[] = [
    { id: 'all', label: `All (${total || 0})` },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'achieved', label: `Achieved (${achievedCount})` },
  ];

  return {
    isLoading,
    isError,
    refetch,
    isRefetching,
    activeFilter,
    setActiveFilter,
    totalSaved,
    totalTarget,
    overallProgress,
    currency,
    achievedCount,
    filterChips,
    filteredGoals,
  };
}
