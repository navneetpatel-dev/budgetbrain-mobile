/** Returns value when it is an array; otherwise []. */
export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

/** Pulls items from a paginated API payload or a bare array. */
export function extractPaginatedItems<T>(response: unknown, itemsKey: string): T[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === 'object' && itemsKey in response) {
    return ensureArray<T>((response as Record<string, unknown>)[itemsKey]);
  }
  return [];
}
