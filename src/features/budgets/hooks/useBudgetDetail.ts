import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, getApiErrorMessage } from '@/shared/services/api';
import { invalidateBudgetQueries } from '@/shared/services/queryInvalidation';
import type { Budget } from '@/shared/types';

export interface BudgetForm {
  name: string;
  amount: string;
  alertThreshold: string;
}

export function useBudgetDetail(id: string) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data: budget, isLoading, isError, refetch } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => apiGet<Budget>(`/budgets/${id}`),
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<BudgetForm>) => {
      if (!budget) return;
      reset({
        name: budget.name,
        amount: String(budget.amount),
        alertThreshold: String(budget.alertThreshold),
      });
    },
    [budget],
  );

  const save = async (data: BudgetForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const updated = await apiPatch<Budget>(`/budgets/${id}`, {
        name: data.name,
        amount: Number(data.amount),
        alertThreshold: Number(data.alertThreshold),
      });
      queryClient.setQueryData(['budget', id], updated);
      invalidateBudgetQueries(queryClient, id);
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update budget'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    budget,
    isLoading,
    isError,
    refetch,
    loading,
    save,
    populateForm,
    submitError,
    clearSubmitError,
  };
}
