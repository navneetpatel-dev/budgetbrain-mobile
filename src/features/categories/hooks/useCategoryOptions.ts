import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Category } from '@/shared/types';

export function useCategoryOptions() {
  return usePaginatedList<Category, 'categories'>({
    queryKey: ['categories'],
    url: '/categories',
    itemsKey: 'categories',
  });
}
