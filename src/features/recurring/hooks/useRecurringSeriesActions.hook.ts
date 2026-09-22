import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiPatch, apiDelete, getApiErrorMessage } from '@/shared/services/api';
import { invalidateRecurringQueries } from '@/shared/services/queryInvalidation';

/** Dismiss (deactivate) or delete a subscription/bill series. */
export function useRecurringSeriesActions() {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dismiss = async (id: string) => {
    setPendingId(id);
    setError(null);
    try {
      await apiPatch(`/recurring-series/${id}`, { active: false });
      invalidateRecurringQueries(queryClient);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not dismiss'));
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (id: string) => {
    setPendingId(id);
    setError(null);
    try {
      await apiDelete(`/recurring-series/${id}`);
      invalidateRecurringQueries(queryClient);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete'));
    } finally {
      setPendingId(null);
    }
  };

  return { dismiss, remove, pendingId, error };
}
