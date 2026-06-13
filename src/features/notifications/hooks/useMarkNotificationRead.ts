import { apiPatch } from '@/shared/services/api';
import { useInfinitePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { NotificationItem } from '@/shared/types';

export function useMarkNotificationRead() {
  const {
    items,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePaginatedList<NotificationItem>({
    queryKey: ['notifications'],
    url: '/notifications',
    itemsKey: 'notifications',
    pageSize: 50,
  });

  const markRead = async (id: string) => {
    await apiPatch(`/notifications/${id}/read`);
    refetch();
  };

  return {
    data: items,
    isLoading,
    isRefetching,
    refetch,
    markRead,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
