import { useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/shared/services/api';
import { invalidateLoanQueries, removeLoanDetail } from '@/shared/services/queryInvalidation';

export function useDeleteLoan() {
  const queryClient = useQueryClient();

  const deleteLoan = async (id: string) => {
    await apiDelete(`/loans/${id}`);
    removeLoanDetail(queryClient, id);
    invalidateLoanQueries(queryClient);
  };

  return { deleteLoan };
}
