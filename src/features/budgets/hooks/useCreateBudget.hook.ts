import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateBudgetQueries } from '@/shared/services/queryInvalidation';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
import type { Budget } from '@/shared/types';
import { ValidationMessages } from '@/shared/validation/fieldLimits';

export interface BudgetForm {
  name: string;
  type: 'monthly' | 'weekly' | 'custom';
  amount: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  alertThreshold: string;
  rollover: boolean;
}

/** How long the success confirmation stays visible before navigating back. */
const SAVE_CONFIRM_DELAY_MS = 900;

export function useCreateBudget() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const create = async (data: BudgetForm) => {
    setSubmitError(null);
    if (data.type === 'custom') {
      if (!data.endDate) {
        setSubmitError(ValidationMessages.endDateRequired);
        return;
      }
      if (data.endDate < data.startDate) {
        setSubmitError(ValidationMessages.endDateBeforeStart);
        return;
      }
    }

    const payload = {
      name: data.name,
      type: data.type,
      amount: Number(data.amount),
      categoryId: !data.categoryId || data.categoryId === '__all__' ? undefined : data.categoryId,
      startDate: data.startDate,
      endDate: data.type === 'custom' ? data.endDate : undefined,
      alertThreshold: Number(data.alertThreshold),
      rollover: data.type === 'custom' ? false : data.rollover,
    };

    setLoading(true);
    try {
      if (!(await isOnline())) {
        queueOfflineAction('create', payload, 'budget');
        invalidateBudgetQueries(queryClient);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setJustSaved(true);
        setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
        return;
      }

      await apiPost<Budget>('/budgets', payload);
      invalidateBudgetQueries(queryClient);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
    } catch (err) {
      const isGenuineNetworkFailure = axios.isAxiosError(err) && !err.response;
      if (isGenuineNetworkFailure) {
        queueOfflineAction('create', payload, 'budget');
        invalidateBudgetQueries(queryClient);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setJustSaved(true);
        setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
        return;
      }
      setSubmitError(getApiErrorMessage(err, 'Could not create budget'));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError, justSaved };
}
