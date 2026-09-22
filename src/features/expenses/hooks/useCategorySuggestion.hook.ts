import { useCallback, useRef, useState } from 'react';
import { apiGet } from '@/shared/services/api';

/** Suggests a category based on merchant history; call `suggest` on merchant field blur. */
export function useCategorySuggestion() {
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);

  const latestRequestId = useRef(0);

  const suggest = useCallback(async (merchant: string) => {
    const trimmed = merchant.trim();
    const requestId = ++latestRequestId.current;
    if (!trimmed) {
      setSuggestedCategoryId(null);
      return;
    }
    try {
      const result = await apiGet<{ categoryId: string | null }>('/categories/suggest', { merchant: trimmed });
      if (requestId !== latestRequestId.current) return;
      setSuggestedCategoryId(result?.categoryId ?? null);
    } catch {
      if (requestId !== latestRequestId.current) return;
      setSuggestedCategoryId(null);
    }
  }, []);

  const clear = useCallback(() => setSuggestedCategoryId(null), []);

  return { suggestedCategoryId, suggest, clear };
}
