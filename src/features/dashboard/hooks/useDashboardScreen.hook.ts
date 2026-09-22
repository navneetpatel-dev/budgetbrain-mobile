import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { apiGet } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import { formatCurrency } from '@/shared/utils/currency';
import { useDashboardWidgets } from './useDashboardWidgets.hook';
import type { DashboardData } from '@/shared/types';

interface NetWorthSummary {
  summary: { netWorth: number; currency: string };
}

export function useDashboardScreen() {
  const user = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/expenses/dashboard'),
  });
  const { data: netWorthData } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthSummary>('/net-worth'),
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const { budgetWidgets, goalWidgets } = useDashboardWidgets(
    data?.budgets ?? [],
    data?.goals ?? [],
  );

  const summary = data?.summary;
  const currency = summary?.currency ?? user?.currency ?? 'INR';
  const transactions = data?.recentTransactions ?? [];
  const goals = data?.goals ?? [];
  const goalsCount = goals.length;
  // Server-computed per-goal progressPercentage (MOBILE doc §12) — only the average across
  // goals is computed here, not any individual goal's own percentage.
  const goalsProgress = goalsCount
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goalsCount)
    : null;
  const netWorthAmount = netWorthData?.summary
    ? formatCurrency(netWorthData.summary.netWorth, netWorthData.summary.currency || currency)
    : '—';
  const noSpendStreak = data?.noSpendStreak ?? 0;
  const upcomingBills = data?.upcomingBills ?? [];

  return {
    user,
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    budgetWidgets,
    goalWidgets,
    summary,
    currency,
    transactions,
    goalsCount,
    goalsProgress,
    netWorthAmount,
    noSpendStreak,
    upcomingBills,
  };
}
