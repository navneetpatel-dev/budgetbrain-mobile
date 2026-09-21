import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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
 * Expo Router SSR evaluates the web bundle in Node. AsyncStorage's web backend
 * reads `window.localStorage`, which throws `window is not defined` and kills
 * Metro. TanStack treats `undefined` storage as an SSR no-op persister.
 */
function queryCacheStorage() {
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return undefined;
  }
  return AsyncStorage;
}

let persistenceStarted = false;

/**
 * Offline "Local Data Storage" support (requirements.md): persists TanStack Query's
 * cache to AsyncStorage so screens (dashboard totals, transaction list, etc.) can
 * render last-known data immediately on cold start while offline, instead of an
 * empty/loading state. Money values themselves are never recomputed here — this
 * only replays the exact server response that was last cached.
 */
export function initQueryPersistence(): void {
  if (persistenceStarted) return;
  persistenceStarted = true;

  const persister = createAsyncStoragePersister({
    storage: queryCacheStorage(),
    key: 'budgetbrain-query-cache',
  });

  const [, restore] = persistQueryClient({
    queryClient,
    persister,
    maxAge: CACHE_MAX_AGE_MS,
    dehydrateOptions: {
      // Only persist successful reads — never persist mutation-adjacent/error state.
      shouldDehydrateQuery: (query) => query.state.status === 'success',
    },
  });

  // persistQueryClient rethrows restore failures. Leave them unhandled and Node
  // (Expo's web SSR renderer) treats that as a fatal process crash.
  void restore.catch(() => {});
}
