import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import type { Transaction } from '@/shared/types';

export interface IncomeForm {
  amount: string;
  notes: string;
  date: string;
}

type PendingAction = 'update' | 'duplicate' | 'delete' | null;

export function useIncomeDetail(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const goHome = useCallback(() => {
    router.dismissTo('/(tabs)');
  }, [router]);

  const { data: income, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['income', id],
    queryFn: () => apiGet<Transaction>(`/income/${id}`),
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<IncomeForm>) => {
      if (!income) return;
      reset({ amount: String(income.amount), notes: income.notes ?? '', date: income.date });
    },
    [income],
  );

  const save = async (data: IncomeForm) => {
    setPendingAction('update');
    setSubmitError(null);
    try {
      const updated = await apiPatch<Transaction>(`/income/${id}`, {
        amount: Number(data.amount),
        notes: data.notes || undefined,
        date: data.date,
      });
      queryClient.setQueryData(['income', id], updated);
      void queryClient.invalidateQueries({ queryKey: ['income', id] });
      invalidateMoneyQueries(queryClient);
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update income'));
      return false;
    } finally {
      setPendingAction(null);
    }
  };

  const duplicate = async () => {
    setPendingAction('duplicate');
    setSubmitError(null);
    try {
      await apiPost(`/income/${id}/duplicate`);
      invalidateMoneyQueries(queryClient);
      goHome();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not duplicate income'));
    } finally {
      setPendingAction(null);
    }
  };

  const confirmDelete = () => {
    showConfirmation(CONFIRM.deleteIncome, async () => {
      setPendingAction('delete');
      setSubmitError(null);
      try {
        await apiDelete(`/income/${id}`);
        void queryClient.removeQueries({ queryKey: ['income', id] });
        invalidateMoneyQueries(queryClient);
        goHome();
      } catch (err) {
        setSubmitError(getApiErrorMessage(err, 'Could not delete income'));
      } finally {
        setPendingAction(null);
      }
    });
  };

  return {
    income,
    isLoading,
    isError,
    refetch,
    isRefetching,
    loading: pendingAction !== null,
    updating: pendingAction === 'update',
    duplicating: pendingAction === 'duplicate',
    deleting: pendingAction === 'delete',
    save,
    duplicate,
    populateForm,
    confirmDelete,
    submitError,
    clearSubmitError,
  };
}
