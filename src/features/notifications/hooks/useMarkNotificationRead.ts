import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/shared/services/api';
import type { NotificationItem } from '@/shared/types';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<NotificationItem[]>('/notifications'),
  });

  const markRead = async (id: string) => {
    await apiPatch(`/notifications/${id}/read`);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return {
    data,
    isLoading,
    refetch,
    isRefetching,
    markRead,
  };
}
