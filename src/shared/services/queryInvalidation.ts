import type { QueryClient } from '@tanstack/react-query';

/** Invalidate caches affected by expense/income changes. */
export function invalidateMoneyQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['transactions'] });
  void queryClient.invalidateQueries({ queryKey: ['income'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  void queryClient.invalidateQueries({ queryKey: ['budgets'] });
  void queryClient.invalidateQueries({ queryKey: ['search'] });
  void queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
  void queryClient.invalidateQueries({ queryKey: ['ai-anomalies'] });
}

export function invalidateBudgetQueries(queryClient: QueryClient, budgetId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['budgets'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  if (budgetId) {
    void queryClient.invalidateQueries({ queryKey: ['budget', budgetId] });
  }
}

export function removeBudgetDetail(queryClient: QueryClient, budgetId: string) {
  void queryClient.removeQueries({ queryKey: ['budget', budgetId] });
}

export function invalidateGoalQueries(queryClient: QueryClient, goalId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['goals'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  if (goalId) {
    void queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
  }
}

export function removeGoalDetail(queryClient: QueryClient, goalId: string) {
  void queryClient.removeQueries({ queryKey: ['goal', goalId] });
}

export function invalidateCategoryConsumers(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['categories'] });
  void queryClient.invalidateQueries({ queryKey: ['transactions'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  void queryClient.invalidateQueries({ queryKey: ['search'] });
  void queryClient.invalidateQueries({ queryKey: ['budgets'] });
}

export function invalidateLoanQueries(queryClient: QueryClient, loanId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['loans'] });
  if (loanId) {
    void queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
  }
}

export function removeLoanDetail(queryClient: QueryClient, loanId: string) {
  void queryClient.removeQueries({ queryKey: ['loan', loanId] });
}

export function invalidateRecurringQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['recurring-series'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function invalidateFamilyQueries(queryClient: QueryClient, groupId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['family-groups'] });
  if (groupId) {
    void queryClient.invalidateQueries({ queryKey: ['family-members', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['family-balances', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['family-splits', groupId] });
  }
}
