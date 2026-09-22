import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
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
    const payload = {
      amount: Number(data.amount),
      notes: data.notes || undefined,
      date: data.date,
      incomeSourceId: data.incomeSourceId || undefined,
      type: 'income',
    };

    try {
      let incomeSourceId = data.incomeSourceId;

      const online = await isOnline();
      if (!online) {
        queueOfflineAction('create', payload, 'income');
        invalidateMoneyQueries(queryClient);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setJustSaved(true);
        setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
        return;
      }

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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setJustSaved(true);
      setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
    } catch (err) {
      const isGenuineNetworkFailure = axios.isAxiosError(err) && !err.response;
      if (isGenuineNetworkFailure) {
        queueOfflineAction('create', payload, 'income');
        invalidateMoneyQueries(queryClient);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setJustSaved(true);
        setTimeout(() => router.back(), SAVE_CONFIRM_DELAY_MS);
        return;
      }
      setSubmitError(getApiErrorMessage(err, 'Could not save income'));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, submitError, clearSubmitError, justSaved };
}
