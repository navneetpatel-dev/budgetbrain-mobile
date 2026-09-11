import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateFamilyQueries } from '@/shared/services/queryInvalidation';

/** Settles one or more individual split-participant rows. */
export function useSettleSplit(groupId?: string) {
  const queryClient = useQueryClient();
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const settle = async (id: string) => {
    setSettlingId(id);
    setError(null);
    try {
      await apiPost(`/family/splits/${id}/settle`, {});
      invalidateFamilyQueries(queryClient, groupId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not settle split'));
    } finally {
      setSettlingId(null);
    }
  };

  const settleMany = async (ids: string[]) => {
    setSettlingId(ids[0] ?? null);
    setError(null);
    try {
      await Promise.all(ids.map((id) => apiPost(`/family/splits/${id}/settle`, {})));
      invalidateFamilyQueries(queryClient, groupId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not settle split'));
    } finally {
      setSettlingId(null);
    }
  };

  return { settle, settleMany, settlingId, error };
}
