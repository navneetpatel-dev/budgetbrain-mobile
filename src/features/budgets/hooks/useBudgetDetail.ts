import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, getApiErrorMessage } from '@/shared/services/api';
import { invalidateBudgetQueries } from '@/shared/services/queryInvalidation';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
import type { Budget } from '@/shared/types';

export interface BudgetForm {
  name: string;
  amount: string;
  alertThreshold: string;
  rollover: boolean;
}

export function useBudgetDetail(id: string) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data: budget, isLoading, isError, refetch, isRefetching } = useQuery({
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
        rollover: budget.rollover ?? false,
      });
    },
    [budget],
  );

  const save = async (data: BudgetForm) => {
    setLoading(true);
    setSubmitError(null);
    const payload = {
      id,
      name: data.name,
      amount: Number(data.amount),
      alertThreshold: Number(data.alertThreshold),
      rollover: data.rollover,
    };
    try {
      if (!(await isOnline())) {
        queueOfflineAction('update', payload, 'budget');
        queryClient.setQueryData<Budget>(['budget', id], (prev) =>
          prev ? { ...prev, ...payload } : prev
        );
        invalidateBudgetQueries(queryClient, id);
        return true;
      }

      const updated = await apiPatch<Budget>(`/budgets/${id}`, {
        name: data.name,
        amount: Number(data.amount),
        alertThreshold: Number(data.alertThreshold),
        rollover: data.rollover,
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
    isRefetching,
    loading,
    save,
    populateForm,
    submitError,
    clearSubmitError,
  };
}
