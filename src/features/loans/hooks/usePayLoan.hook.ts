import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateLoanQueries } from '@/shared/services/queryInvalidation';
import type { Loan } from '@/shared/types';

export interface PayLoanForm {
  amount: string;
  notes: string;
}

const SAVE_CONFIRM_DELAY_MS = 900;

export function usePayLoan(loanId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const pay = async (data: PayLoanForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const result = await apiPost<{ loan: Loan }>(`/loans/${loanId}/pay`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
      });
      if (result?.loan) {
        queryClient.setQueryData(['loan', loanId], result.loan);
      }
      invalidateLoanQueries(queryClient, loanId);
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not record payment'));
    } finally {
      setLoading(false);
    }
  };

  return { pay, loading, submitError, clearSubmitError, justSaved };
}
