import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setLearnedRule, setPendingReviewCount } from '@/shared/store/transactionDetectionSlice';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import type { DetectedTransactionDto } from '../types/transactionDetection.types';
import {
  confirmDetectedTransaction,
  fetchPendingDetected,
  rejectDetectedTransaction,
  type ConfirmPayload,
} from '../api/detectedTransactions.api';

const PENDING_KEY = ['detected-transactions', 'pending'] as const;

export function useDetectedTransactionsReview() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  // A notification about one item opens the list with that item first (plan T2.12).
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  const query = useQuery({
    queryKey: PENDING_KEY,
    queryFn: async () => {
      const res = await fetchPendingDetected(1, 50);
      dispatch(setPendingReviewCount(res.pagination.total));
      return res.items;
    },
  });

  const removeLocally = (id: string) => {
    queryClient.setQueryData<DetectedTransactionDto[]>(PENDING_KEY, (items) => (items ?? []).filter((i) => i.id !== id));
  };

  const confirm = useMutation({
    mutationFn: ({ item, overrides }: { item: DetectedTransactionDto; overrides: ConfirmPayload }) =>
      confirmDetectedTransaction(item.id, overrides),
    onSuccess: (confirmed, { item, overrides }) => {
      // The server learns merchant → category only when the user changed it (gap L3); keep the
      // on-device rule cache in step so local categorisation matches.
      const changed = overrides.categoryId !== undefined && overrides.categoryId !== item.categoryId;
      if (changed && overrides.categoryId && confirmed.merchant) {
        dispatch(
          setLearnedRule({
            merchant: confirmed.merchant,
            categoryId: overrides.categoryId,
            categoryName: confirmed.categoryName ?? undefined,
            updatedAt: new Date().toISOString(),
          })
        );
      }
      removeLocally(item.id);
      invalidateMoneyQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: PENDING_KEY });
    },
  });

  const reject = useMutation({
    mutationFn: (id: string) => rejectDetectedTransaction(id),
    onSuccess: (_dto, id) => {
      removeLocally(id);
      void queryClient.invalidateQueries({ queryKey: PENDING_KEY });
    },
  });

  const items = useMemo(() => {
    const list = query.data ?? [];
    const focused = focus ? list.find((item) => item.id === focus) : undefined;
    return focused ? [focused, ...list.filter((item) => item !== focused)] : list;
  }, [query.data, focus]);

  const mutationError = confirm.error ?? reject.error;
  return {
    items,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    error: query.error
      ? 'Unable to load pending review items'
      : mutationError
        ? getApiErrorMessage(mutationError, 'Could not update this transaction')
        : null,
    refresh: () => query.refetch(),
    confirmTransaction: (item: DetectedTransactionDto, overrides: ConfirmPayload = {}) =>
      confirm.mutate({ item, overrides }),
    rejectTransaction: (id: string) => reject.mutate(id),
    busyId: confirm.isPending ? confirm.variables?.item.id : reject.isPending ? reject.variables : undefined,
  };
}
