import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import type { IncomeSource, Transaction } from '@/shared/types';

export interface IncomeForm {
  amount: string;
  notes: string;
  date: string;
  incomeSourceId: string;
  newSourceName: string;
  newSourceType: string;
}

const SAVE_CONFIRM_DELAY_MS = 900;

export function useCreateIncome() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const create = async (data: IncomeForm, showNewSource: boolean) => {
    setLoading(true);
    setSubmitError(null);
    try {
      let incomeSourceId = data.incomeSourceId;

      if (showNewSource && data.newSourceName) {
        const source = await apiPost<IncomeSource>('/income/sources', {
          name: data.newSourceName,
          type: data.newSourceType,
        });
        incomeSourceId = source.id;
        void queryClient.invalidateQueries({ queryKey: ['income-sources'] });
      }

      await apiPost<Transaction>('/income', {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
        incomeSourceId: incomeSourceId || undefined,
      });

      invalidateMoneyQueries(queryClient);
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save income'));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError, justSaved };
}
