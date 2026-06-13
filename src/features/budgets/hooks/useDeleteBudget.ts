import { useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/shared/services/api';

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  const deleteBudget = async (id: string) => {
    await apiDelete(`/budgets/${id}`);
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return { deleteBudget };
}
