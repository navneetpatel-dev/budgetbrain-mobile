import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';

export function useExpenseTagSuggestions() {
  const { data } = useQuery({
    queryKey: ['expense-tag-suggestions'],
    queryFn: () => apiGet<{ tags: string[] }>('/expenses/tags/suggestions'),
    staleTime: 60_000,
  });

  return { suggestions: data?.tags ?? [] };
}
