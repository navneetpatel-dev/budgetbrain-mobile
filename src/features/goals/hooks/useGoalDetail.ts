import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UseFormReset } from 'react-hook-form';
import { apiGet, apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateGoalQueries, removeGoalDetail } from '@/shared/services/queryInvalidation';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import type { Goal } from '@/shared/types';

export interface GoalForm {
  name: string;
  targetAmount: string;
  targetDate: string;
}

export function useGoalDetail(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data: goal, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => apiGet<Goal>(`/goals/${id}`),
    enabled: !!id,
  });

  const populateForm = useCallback(
    (reset: UseFormReset<GoalForm>) => {
      if (!goal) return;
      reset({
        name: goal.name,
        targetAmount: String(goal.targetAmount),
        targetDate: goal.targetDate ?? '',
      });
    },
    [goal],
  );

  const save = async (data: GoalForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const updated = await apiPatch<Goal>(`/goals/${id}`, {
        name: data.name,
        targetAmount: Number(data.targetAmount),
        targetDate: data.targetDate || undefined,
      });
      queryClient.setQueryData(['goal', id], updated);
      invalidateGoalQueries(queryClient, id);
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update goal'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showConfirmation(CONFIRM.deleteGoal, async () => {
      setLoading(true);
      setSubmitError(null);
      try {
        await apiDelete(`/goals/${id}`);
        removeGoalDetail(queryClient, id);
        invalidateGoalQueries(queryClient);
        router.back();
      } catch (err) {
        setSubmitError(getApiErrorMessage(err, 'Could not delete goal'));
      } finally {
        setLoading(false);
      }
    });
  };

  return {
    goal,
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
