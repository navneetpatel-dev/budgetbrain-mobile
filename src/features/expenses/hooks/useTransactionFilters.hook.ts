import { useMemo } from 'react';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import type { Category, IncomeSource } from '@/shared/types';
import { DateBounds } from '@/shared/utils/dateBounds';
import { useExpenseTagSuggestions } from '@/features/expenses/hooks/useExpenseTagSuggestions.hook';
import type {
  DatePreset,
  TransactionListFilters,
  TransactionTypeFilter,
} from '@/features/expenses/utils/transactionFilters';

export function useTransactionFilters(
  filters: TransactionListFilters,
  onChange: (next: TransactionListFilters) => void,
  categories: Category[],
  sources: IncomeSource[],
) {
  const { suggestions: tagSuggestions } = useExpenseTagSuggestions();
  const showCategory = filters.type !== 'income';
  const showSource = filters.type !== 'expense';
  const showPayment = filters.type !== 'income';

  const paymentOptions = useMemo(
    () => ['', ...PAYMENT_METHODS.map((p) => p.value)],
    [],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.name })),
    [categories],
  );
  const sourceOptions = useMemo(
    () => sources.map((s) => ({ id: s.id, label: s.name })),
    [sources],
  );
  const tagOptions = useMemo(
    () => tagSuggestions.map((t) => ({ id: t, label: t })),
    [tagSuggestions],
  );

  const fromBounds = DateBounds.rangeFrom(filters.endDate, filters.startDate);
  const toBounds = DateBounds.rangeTo(filters.startDate, filters.endDate);

  const patch = (partial: Partial<TransactionListFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const handleTypeChange = (type: TransactionTypeFilter) =>
    patch({
      type,
      categoryId: type === 'income' ? undefined : filters.categoryId,
      incomeSourceId: type === 'expense' ? undefined : filters.incomeSourceId,
      paymentMethod: type === 'income' ? undefined : filters.paymentMethod,
    });

  const handleDatePresetChange = (datePreset: DatePreset) =>
    patch({
      datePreset,
      startDate: datePreset === 'custom' ? filters.startDate : undefined,
      endDate: datePreset === 'custom' ? filters.endDate : undefined,
    });

  const handleStartDateChange = (startDate: string) => {
    const next: Partial<TransactionListFilters> = { startDate };
    if (filters.endDate && startDate && filters.endDate < startDate) {
      next.endDate = startDate;
    }
    patch(next);
  };

  const handleEndDateChange = (endDate: string) => patch({ endDate });
  const handleCategoryChange = (categoryId: string | undefined) => patch({ categoryId });
  const handleSourceChange = (incomeSourceId: string | undefined) => patch({ incomeSourceId });
  const handleTagChange = (tag: string | undefined) => patch({ tag });
  const handlePaymentChange = (paymentMethod: string) =>
    patch({ paymentMethod: paymentMethod || undefined });

  const paymentLabel = (id: string) =>
    id ? (PAYMENT_METHODS.find((p) => p.value === id)?.label ?? id) : 'All methods';

  return {
    showCategory,
    showSource,
    showPayment,
    showTags: tagSuggestions.length > 0,
    paymentOptions,
    categoryOptions,
    sourceOptions,
    tagOptions,
    fromBounds,
    toBounds,
    handleTypeChange,
    handleDatePresetChange,
    handleStartDateChange,
    handleEndDateChange,
    handleCategoryChange,
    handleSourceChange,
    handleTagChange,
    handlePaymentChange,
    paymentLabel,
  };
}
