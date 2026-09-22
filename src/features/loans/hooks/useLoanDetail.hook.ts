import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateLoanQueries, removeLoanDetail } from '@/shared/services/queryInvalidation';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import type { Loan } from '@/shared/types';

export interface LoanEditForm {
  name: string;
  interestRate: string;
  emiAmount: string;
  notes: string;
}

export function useLoanDetail(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data: loan, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => apiGet<Loan>(`/loans/${id}`),
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<LoanEditForm>) => {
      if (!loan) return;
      reset({
        name: loan.name,
        interestRate: loan.interestRate != null ? String(loan.interestRate) : '',
        emiAmount: loan.emiAmount != null ? String(loan.emiAmount) : '',
        notes: loan.notes ?? '',
      });
    },
    [loan],
  );

  const save = async (data: LoanEditForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const updated = await apiPatch<Loan>(`/loans/${id}`, {
        name: data.name,
        interestRate: data.interestRate ? Number(data.interestRate) : undefined,
        emiAmount: data.emiAmount ? Number(data.emiAmount) : undefined,
        notes: data.notes || undefined,
      });
      queryClient.setQueryData(['loan', id], updated);
      invalidateLoanQueries(queryClient, id);
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update loan'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showConfirmation(CONFIRM.deleteLoan, async () => {
      setLoading(true);
      setSubmitError(null);
      try {
        await apiDelete(`/loans/${id}`);
        removeLoanDetail(queryClient, id);
        invalidateLoanQueries(queryClient);
        router.back();
      } catch (err) {
        setSubmitError(getApiErrorMessage(err, 'Could not delete loan'));
      } finally {
        setLoading(false);
      }
    });
  };

  return {
    loan,
    isLoading,
    isError,
    refetch,
    isRefetching,
    loading,
    save,
    populateForm,
    confirmDelete,
    submitError,
    clearSubmitError,
  };
}
