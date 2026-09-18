import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 2,
      refetchOnWindowFocus: false,
      // Persisted queries need an explicit gcTime so they survive across app restarts.
      gcTime: CACHE_MAX_AGE_MS,
    },
  },
});

/**
 * Offline "Local Data Storage" support (requirements.md): persists TanStack Query's
 * cache to AsyncStorage so screens (dashboard totals, transaction list, etc.) can
 * render last-known data immediately on cold start while offline, instead of an
 * empty/loading state. Money values themselves are never recomputed here — this
 * only replays the exact server response that was last cached.
 */
export function initQueryPersistence(): void {
  const persister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'budgetbrain-query-cache',
  });

  void persistQueryClient({
    queryClient,
    persister,
    maxAge: CACHE_MAX_AGE_MS,
    dehydrateOptions: {
      // Only persist successful reads — never persist mutation-adjacent/error state.
      shouldDehydrateQuery: (query) => query.state.status === 'success',
    },
  });
}
