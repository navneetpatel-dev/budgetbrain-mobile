import { useMemo } from 'react';
import { getBudgetSpent } from '@/src/features/budgets/components/BudgetCard';
import type { Budget, Goal, Transaction } from '@/src/shared/types';

export function useDashboardWidgets(
  budgets: Budget[],
  goals: Goal[],
  expenses: Transaction[],
) {
  const budgetWidgets = useMemo(
    () =>
      budgets.slice(0, 3).map((b) => {
        const spent = getBudgetSpent(b, expenses);
        const limit = Number(b.amount);
        const progress = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        return { budget: b, spent, limit, progress };
      }),
    [budgets, expenses],
  );

  const goalWidgets = useMemo(
    () =>
      goals.slice(0, 3).map((g) => {
        const current = Number(g.currentAmount);
        const target = Number(g.targetAmount);
        const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        return { goal: g, current, target, progress };
      }),
    [goals],
  );

  return { budgetWidgets, goalWidgets };
}
