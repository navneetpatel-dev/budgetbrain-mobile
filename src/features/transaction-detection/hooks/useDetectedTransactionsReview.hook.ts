import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { decrementPendingReviewCount } from '@/shared/store/transactionDetectionSlice';
import type { ProcessedTransaction } from '../types/transactionDetection.types';
import {
  fetchPendingDetected,
  confirmDetectedTransaction,
  rejectDetectedTransaction,
  type ConfirmPayload,
} from '../api/detectedTransactions.api';
import { queryClient } from '@/shared/services/queryClient';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { learnMerchantCategoryPreference } from '../services/userLearning.service';

export function useDetectedTransactionsReview() {
  const dispatch = useDispatch();
  const [items, setItems] = useState<ProcessedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPending = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await fetchPendingDetected(1, 50);
      setItems(res.items || []);
    } catch {
      setError('Unable to load pending review items');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleConfirm = async (item: ProcessedTransaction, overrides: ConfirmPayload = {}) => {
    try {
      await confirmDetectedTransaction(item.id, overrides);

      // Learn preference if merchant and category exist
      const merchantToLearn = overrides.merchant || item.normalizedMerchant || item.merchant;
      const categoryToLearn = overrides.categoryId || item.categoryId;
      if (merchantToLearn && categoryToLearn && overrides.learnMerchantCategory !== false) {
        await learnMerchantCategoryPreference(
          merchantToLearn,
          categoryToLearn,
          item.categoryName || undefined
        );
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      dispatch(decrementPendingReviewCount());
      invalidateMoneyQueries(queryClient);
    } catch {
      // Handled gracefully in UI
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectDetectedTransaction(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      dispatch(decrementPendingReviewCount());
    } catch {
      // Handled gracefully in UI
    }
  };

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    refresh: () => loadPending(true),
    confirmTransaction: handleConfirm,
    rejectTransaction: handleReject,
  };
}
