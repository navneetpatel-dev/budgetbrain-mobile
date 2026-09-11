import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { RecurringSeries } from '@/shared/types';

export function useRecurringSeries() {
  return usePaginatedList<RecurringSeries, 'recurringSeries'>({
    queryKey: ['recurring-series'],
    url: '/recurring-series',
    itemsKey: 'recurringSeries',
  });
}

/** Monthly-equivalent cost across active series (weekly ×~4.33, yearly ÷12). */
export function monthlyEquivalent(series: RecurringSeries): number {
  if (series.cadence === 'weekly') return series.amount * 4.345;
  if (series.cadence === 'yearly') return series.amount / 12;
  return series.amount;
}
