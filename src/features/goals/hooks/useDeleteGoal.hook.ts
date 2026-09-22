import { useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/shared/services/api';
import { invalidateGoalQueries, removeGoalDetail } from '@/shared/services/queryInvalidation';

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  const deleteGoal = async (id: string) => {
    await apiDelete(`/goals/${id}`);
    removeGoalDetail(queryClient, id);
    invalidateGoalQueries(queryClient);
  };

  return { deleteGoal };
}
