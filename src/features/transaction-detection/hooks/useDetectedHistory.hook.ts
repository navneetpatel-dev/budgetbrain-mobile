import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { fetchDetected, undoDetectedTransaction } from '../api/detectedTransactions.api';
import type { DetectedTransactionDto } from '../types/transactionDetection.types';

export type DetectedHistoryFilter = 'added' | 'auto' | 'confirmed' | 'transfers';

const STATUS_FOR: Record<DetectedHistoryFilter, DetectedTransactionDto['status'] | undefined> = {
  added: undefined,
  auto: 'auto_approved',
  confirmed: 'user_confirmed',
  transfers: undefined,
};

/** Detected items that became transactions, and transfers, with Undo (plan T5.5). */
export function useDetectedHistory() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<DetectedHistoryFilter>('added');
  const key = ['detected-transactions', 'history', filter] as const;

  const query = useQuery({ queryKey: key, queryFn: () => fetchDetected(STATUS_FOR[filter], 1, 100) });

  const items = useMemo(() => {
    const all = query.data?.items ?? [];
    const added = all.filter((item) => item.status === 'auto_approved' || item.status === 'user_confirmed');
    return filter === 'transfers' ? added.filter((item) => item.transactionType === 'transfer') : added;
  }, [query.data, filter]);

  const undo = useMutation({
    mutationFn: (id: string) => undoDetectedTransaction(id),
    onSuccess: () => {
      invalidateMoneyQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: ['detected-transactions'] });
    },
  });

  return {
    filter,
    setFilter,
    items,
    isLoading: query.isLoading,
    isRefreshing: query.isRefetching,
    refresh: () => query.refetch(),
    undo: (id: string) => undo.mutate(id),
    undoingId: undo.isPending ? undo.variables : undefined,
    error: query.error
      ? 'Unable to load detected transactions'
      : undo.error
        ? getApiErrorMessage(undo.error, 'Could not undo this transaction')
        : null,
  };
}
