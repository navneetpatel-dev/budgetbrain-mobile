import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiGet } from '../services/api';
import { ensureArray } from '../utils/listData';
import type { PaginationMeta } from '../types';

export type PaginatedResponse<T, K extends string> = PaginationMeta & Record<K, T[]>;

export async function fetchPaginatedPage<T, K extends string>(
  url: string,
  key: K,
  params: Record<string, unknown> & { page: number; limit: number }
): Promise<PaginatedResponse<T, K>> {
  return apiGet<PaginatedResponse<T, K>>(url, params);
}

export async function fetchAllPages<T, K extends string>(
  url: string,
  key: K,
  params?: Record<string, unknown>,
  pageSize = 100
): Promise<{ items: T[]; total: number }> {
  const first = await fetchPaginatedPage<T, K>(url, key, { ...params, page: 1, limit: pageSize });
  const items = [...ensureArray<T>(first[key])];
  const totalPages = Math.ceil(first.total / pageSize);
  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchPaginatedPage<T, K>(url, key, { ...params, page, limit: pageSize });
    items.push(...ensureArray<T>(next[key]));
  }
  return { items, total: first.total };
}

export function flattenInfinitePages<T>(pages: Record<string, unknown>[] | undefined, itemsKey: string): T[] {
  if (!pages?.length) return [];
  return pages.flatMap((page) => ensureArray<T>(page[itemsKey]));
}

/** Infinite scroll for high-volume lists (expenses, income, search, notifications). */
export function useInfinitePaginatedList<T>(config: {
  queryKey: unknown[];
  url: string;
  itemsKey: string;
  params?: Record<string, unknown>;
  pageSize?: number;
  enabled?: boolean;
}) {
  const pageSize = config.pageSize ?? 20;

  const query = useInfiniteQuery({
    queryKey: [...config.queryKey, config.params, pageSize],
    queryFn: ({ pageParam }) =>
      apiGet<Record<string, unknown>>(config.url, {
        ...config.params,
        page: pageParam,
        limit: pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = Number(lastPage.page);
      const limit = Number(lastPage.limit);
      const total = Number(lastPage.total);
      return page * limit < total ? page + 1 : undefined;
    },
    enabled: config.enabled ?? true,
  });

  const items = useMemo(
    () => flattenInfinitePages<T>(query.data?.pages, config.itemsKey),
    [query.data?.pages, config.itemsKey]
  );

  const total = query.data?.pages[0]?.total as number | undefined;

  return {
    items,
    total: total ?? items.length,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
  };
}

/** Loads all pages upfront — for small/medium lists (categories, budgets, goals, etc.). */
export function usePaginatedList<T, K extends string>(config: {
  queryKey: unknown[];
  url: string;
  itemsKey: K;
  params?: Record<string, unknown>;
  pageSize?: number;
  enabled?: boolean;
}) {
  const pageSize = config.pageSize ?? 100;

  const query = useQuery({
    queryKey: [...config.queryKey, config.params, pageSize],
    queryFn: () => fetchAllPages<T, K>(config.url, config.itemsKey, config.params, pageSize),
    enabled: config.enabled ?? true,
  });

  return {
    data: query.data?.items ?? [],
    total: query.data?.total ?? query.data?.items.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
