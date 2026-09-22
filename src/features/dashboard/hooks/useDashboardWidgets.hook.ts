import { useMemo } from 'react';
import { toSafePercent } from '@/shared/utils/number';
import type { Budget, Goal } from '@/shared/types';

/** Render dashboard widgets exactly as returned by the API (no client truncation). */
export function useDashboardWidgets(budgets: Budget[] | undefined, goals: Goal[] | undefined) {
  const budgetWidgets = useMemo(
    () =>
      (budgets ?? []).map((budget) => {
        const spent = budget.spent ?? 0;
        const limit = budget.amount;
        return { budget, spent, limit, progress: toSafePercent(spent, limit) };
      }),
    [budgets],
  );

  const goalWidgets = useMemo(
    () =>
      (goals ?? []).map((goal) => {
        // progressPercentage is server-computed (MOBILE doc §12) — do not re-derive it here.
        const current = goal.currentAmount;
        const target = goal.targetAmount;
        return { goal, current, target, progress: goal.progressPercentage };
      }),
    [goals],
  );

  return { budgetWidgets, goalWidgets };
}
