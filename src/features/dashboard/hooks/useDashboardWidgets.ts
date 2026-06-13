import { useMemo } from 'react';
import type { Budget, Goal } from '@/shared/types';

export function useDashboardWidgets(budgets: Budget[], goals: Goal[]) {
  const budgetWidgets = useMemo(
    () =>
      budgets.slice(0, 3).map((b) => {
        const spent = b.spent ?? 0;
        const limit = Number(b.amount);
        const progress = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
        return { budget: b, spent, limit, progress };
      }),
    [budgets],
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
