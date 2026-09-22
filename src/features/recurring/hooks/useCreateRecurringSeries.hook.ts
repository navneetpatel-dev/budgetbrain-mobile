import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateRecurringQueries } from '@/shared/services/queryInvalidation';
import type { RecurringSeries } from '@/shared/types';

export interface RecurringSeriesForm {
  merchant: string;
  categoryId: string;
  amount: string;
  cadence: 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
}

export function useCreateRecurringSeries() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const create = async (data: RecurringSeriesForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await apiPost<RecurringSeries>('/recurring-series', {
        merchant: data.merchant,
        categoryId: data.categoryId || undefined,
        amount: Number(data.amount),
        cadence: data.cadence,
        nextDueDate: data.nextDueDate,
      });
      invalidateRecurringQueries(queryClient);
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not add subscription'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError };
}
