import { useCallback, useState } from 'react';
import { apiGet } from '@/shared/services/api';

/** Suggests a category based on merchant history; call `suggest` on merchant field blur. */
export function useCategorySuggestion() {
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);

  const suggest = useCallback(async (merchant: string) => {
    const trimmed = merchant.trim();
    if (!trimmed) {
      setSuggestedCategoryId(null);
      return;
    }
    try {
      const result = await apiGet<{ categoryId: string | null }>('/categories/suggest', { merchant: trimmed });
      setSuggestedCategoryId(result?.categoryId ?? null);
    } catch {
      setSuggestedCategoryId(null);
    }
  }, []);

  const clear = useCallback(() => setSuggestedCategoryId(null), []);

  return { suggestedCategoryId, suggest, clear };
}
