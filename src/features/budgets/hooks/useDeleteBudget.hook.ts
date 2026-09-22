import { useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/shared/services/api';
import { invalidateBudgetQueries, removeBudgetDetail } from '@/shared/services/queryInvalidation';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  const deleteBudget = async (id: string) => {
    if (!(await isOnline())) {
      queueOfflineAction('delete', { id }, 'budget');
      removeBudgetDetail(queryClient, id);
      invalidateBudgetQueries(queryClient);
      return;
    }
    await apiDelete(`/budgets/${id}`);
    removeBudgetDetail(queryClient, id);
    invalidateBudgetQueries(queryClient);
  };

  return { deleteBudget };
}
