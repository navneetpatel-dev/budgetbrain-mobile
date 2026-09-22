import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateLoanQueries } from '@/shared/services/queryInvalidation';
import type { Loan } from '@/shared/types';

export interface LoanForm {
  name: string;
  type: string;
  principal: string;
  interestRate: string;
  emiAmount: string;
  startDate: string;
  dueDayOfMonth: string;
  notes: string;
}

const SAVE_CONFIRM_DELAY_MS = 900;

export function useCreateLoan() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const create = async (data: LoanForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      await apiPost<Loan>('/loans', {
        name: data.name,
        type: data.type,
        principal: Number(data.principal),
        interestRate: data.interestRate ? Number(data.interestRate) : undefined,
        emiAmount: data.emiAmount ? Number(data.emiAmount) : undefined,
        startDate: data.startDate,
        dueDayOfMonth: data.dueDayOfMonth ? Number(data.dueDayOfMonth) : undefined,
        notes: data.notes || undefined,
      });
      invalidateLoanQueries(queryClient);
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not create loan'));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError, justSaved };
}
