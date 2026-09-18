/** How many category/source chips to show inline before “More”. */
export const FILTER_PICKER_PREVIEW_COUNT = 4;
/** Page size when loading income sources / categories for filters. */
export const FILTER_PICKER_FETCH_LIMIT = 100;

export type TransactionTypeFilter = 'all' | 'expense' | 'income';
export type DatePreset = 'all' | 'this_month' | 'last_30' | 'custom';

export type TransactionListFilters = {
  type: TransactionTypeFilter;
  categoryId?: string;
  incomeSourceId?: string;
  paymentMethod?: string;
  datePreset: DatePreset;
  startDate?: string;
  endDate?: string;
  tag?: string;
};

export const DEFAULT_TRANSACTION_FILTERS: TransactionListFilters = {
  type: 'all',
  datePreset: 'all',
};

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function resolveDateRange(filters: TransactionListFilters): {
  startDate?: string;
  endDate?: string;
} {
  if (filters.datePreset === 'custom') {
    return {
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };
  }
  if (filters.datePreset === 'this_month') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toIsoDate(start), endDate: toIsoDate(now) };
  }
  if (filters.datePreset === 'last_30') {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }
  return {};
}

/** Build API query params for GET /expenses (omits empty values). */
export function toExpenseListParams(filters: TransactionListFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.type !== 'all') params.type = filters.type;
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.incomeSourceId) params.incomeSourceId = filters.incomeSourceId;
  if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
  if (filters.tag) params.tag = filters.tag;

  const range = resolveDateRange(filters);
  if (range.startDate) params.startDate = range.startDate;
  if (range.endDate) params.endDate = range.endDate;
  return params;
}

export function countActiveFilters(filters: TransactionListFilters): number {
  let n = 0;
  if (filters.type !== 'all') n += 1;
  if (filters.categoryId) n += 1;
  if (filters.incomeSourceId) n += 1;
  if (filters.paymentMethod) n += 1;
  if (filters.datePreset !== 'all') n += 1;
  if (filters.tag) n += 1;
  return n;
}

export function parseFilterParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0] || undefined;
  return value || undefined;
}

export function buildInitialFilters(params: {
  type?: string | string[];
  categoryId?: string | string[];
  incomeSourceId?: string | string[];
  paymentMethod?: string | string[];
  datePreset?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
}): TransactionListFilters {
  const type = parseFilterParam(params.type);
  const datePreset = parseFilterParam(params.datePreset) as DatePreset | undefined;
  return {
    type: type === 'expense' || type === 'income' ? (type as TransactionTypeFilter) : 'all',
    categoryId: parseFilterParam(params.categoryId),
    incomeSourceId: parseFilterParam(params.incomeSourceId),
    paymentMethod: parseFilterParam(params.paymentMethod),
    datePreset:
      datePreset === 'this_month' || datePreset === 'last_30' || datePreset === 'custom'
        ? datePreset
        : 'all',
    startDate: parseFilterParam(params.startDate),
    endDate: parseFilterParam(params.endDate),
  };
}
