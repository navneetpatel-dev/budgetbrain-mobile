import { useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { setPendingReviewCount } from '@/shared/store/transactionDetectionSlice';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import type { DetectedTransactionDto } from '../types/transactionDetection.types';
import {
  confirmDetectedTransaction,
  fetchPendingDetected,
  rejectDetectedTransaction,
  type ConfirmPayload,
} from '../api/detectedTransactions.api';
import { discardLocal, listLocalPending, type LocalPendingItem } from '../services/store/detectionStore.service';
import { syncMerchantRules } from '../services/detectionProfile.service';
import { reportCorrection } from '../services/detectionTelemetry.service';

const PENDING_KEY = ['detected-transactions', 'pending'] as const;
const LOCAL_KEY = ['detected-transactions', 'local'] as const;

/**
 * One row of the review inbox (plan T5.1): an item waiting on the server, or one detected on this
 * device that hasn't synced yet (shown offline too; it can only be deleted until it syncs).
 */
export type ReviewItem =
  | { kind: 'server'; id: string; item: DetectedTransactionDto }
  | { kind: 'local'; id: string; item: LocalPendingItem };

export function useDetectedTransactionsReview() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.auth.user?.id ?? null);
  // A notification about one item opens the list with that item first (plan T2.12).
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [editingId, setEditingId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: PENDING_KEY,
    queryFn: async () => {
      const res = await fetchPendingDetected(1, 50);
      dispatch(setPendingReviewCount(res.pagination.total));
      return res.items;
    },
  });

  const local = useQuery({
    queryKey: [...LOCAL_KEY, userId],
    queryFn: () => (userId ? listLocalPending(userId) : Promise.resolve([])),
    // Local rows change as the sync runs; a cheap indexed read.
    refetchInterval: 15000,
  });

  const removeLocally = (id: string) => {
    queryClient.setQueryData<DetectedTransactionDto[]>(PENDING_KEY, (items) => (items ?? []).filter((i) => i.id !== id));
  };

  const confirm = useMutation({
    mutationFn: ({ item, overrides }: { item: DetectedTransactionDto; overrides: ConfirmPayload }) =>
      confirmDetectedTransaction(item.id, overrides),
    onSuccess: (_confirmed, { item, overrides }) => {
      // The server learned from the correction, if there was one (T5.2); fetch the rules it keeps.
      void syncMerchantRules({ force: true }).catch(() => {});
      void reportCorrection(item.id, overrides).catch(() => {});
      removeLocally(item.id);
      setEditingId(null);
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

  const discard = useMutation({
    mutationFn: (clientId: string) => discardLocal(clientId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: LOCAL_KEY }),
  });

  const items = useMemo<ReviewItem[]>(() => {
    const server = (query.data ?? []).map((item) => ({ kind: 'server' as const, id: item.id, item }));
    const focused = focus ? server.find((row) => row.id === focus) : undefined;
    const ordered = focused ? [focused, ...server.filter((row) => row !== focused)] : server;
    const pending = (local.data ?? []).map((item) => ({ kind: 'local' as const, id: `local:${item.payload.clientId}`, item }));
    return [...ordered, ...pending];
  }, [query.data, local.data, focus]);

  const editing = useMemo(
    () => (editingId ? (query.data ?? []).find((item) => item.id === editingId) ?? null : null),
    [editingId, query.data]
  );

  const mutationError = confirm.error ?? reject.error ?? discard.error;
  return {
    items,
    serverCount: query.data?.length ?? 0,
    isLoading: query.isLoading && local.isLoading,
    isRefreshing: query.isRefetching,
    // Offline: the server list fails but local items still show.
    error: query.error && (local.data?.length ?? 0) === 0
      ? 'Unable to load pending review items'
      : mutationError
        ? getApiErrorMessage(mutationError, 'Could not update this transaction')
        : null,
    refresh: () => {
      void local.refetch();
      return query.refetch();
    },
    confirmTransaction: (item: DetectedTransactionDto, overrides: ConfirmPayload = {}) => confirm.mutate({ item, overrides }),
    rejectTransaction: (id: string) => reject.mutate(id),
    discardLocalItem: (clientId: string) => discard.mutate(clientId),
    editing,
    openEdit: (id: string) => setEditingId(id),
    closeEdit: () => setEditingId(null),
    isSaving: confirm.isPending,
    busyId: confirm.isPending ? confirm.variables?.item.id : reject.isPending ? reject.variables : undefined,
  };
}
