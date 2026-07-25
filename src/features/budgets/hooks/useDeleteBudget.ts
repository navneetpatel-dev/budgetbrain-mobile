import { useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/shared/services/api';
import { invalidateBudgetQueries, removeBudgetDetail } from '@/shared/services/queryInvalidation';

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  const deleteBudget = async (id: string) => {
    await apiDelete(`/budgets/${id}`);
    removeBudgetDetail(queryClient, id);
    invalidateBudgetQueries(queryClient);
  };

  return { deleteBudget };
}
