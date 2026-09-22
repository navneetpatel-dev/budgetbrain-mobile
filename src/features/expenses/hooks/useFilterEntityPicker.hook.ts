import { useMemo, useState } from 'react';
import { FILTER_PICKER_PREVIEW_COUNT } from '@/features/expenses/utils/transactionFilters';

export type FilterEntityOption = { id: string; label: string };

export function useFilterEntityPicker(
  options: FilterEntityOption[],
  onChange: (id: string | undefined) => void,
  allLabel: string,
  previewCount = FILTER_PICKER_PREVIEW_COUNT,
) {
  const [moreOpen, setMoreOpen] = useState(false);
  const preview = options.slice(0, previewCount);
  const hasMore = options.length > previewCount;
  const clearSelection = () => onChange(undefined);
  const openMore = () => setMoreOpen(true);
  const closeMore = () => setMoreOpen(false);
  const selectOption = (id: string) => onChange(id);

  const sheetItems = useMemo(
    () => [
      { id: '__all__', label: allLabel, onPress: () => onChange(undefined) },
      ...options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        onPress: () => onChange(opt.id),
      })),
    ],
    [allLabel, options, onChange],
  );

  return { preview, hasMore, moreOpen, openMore, closeMore, clearSelection, selectOption, sheetItems };
}
