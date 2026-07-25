import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateBudgetQueries } from '@/shared/services/queryInvalidation';
import type { Budget } from '@/shared/types';
import { ValidationMessages } from '@/shared/validation/fieldLimits';

export interface BudgetForm {
  name: string;
  type: 'monthly' | 'weekly' | 'category';
  amount: string;
  categoryId: string;
  startDate: string;
  alertThreshold: string;
}

export function useCreateBudget() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const create = async (data: BudgetForm) => {
    setSubmitError(null);
    if (data.type === 'category' && !data.categoryId) {
      setSubmitError(ValidationMessages.categoryRequired);
      return;
    }
    setLoading(true);
    try {
      await apiPost<Budget>('/budgets', {
        name: data.name,
        type: data.type,
        amount: Number(data.amount),
        categoryId: data.type === 'category' ? data.categoryId : undefined,
        startDate: data.startDate,
        alertThreshold: Number(data.alertThreshold),
      });
      invalidateBudgetQueries(queryClient);
      router.back();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not create budget'));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError };
}
