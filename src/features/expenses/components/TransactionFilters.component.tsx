import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  DateInput,
  FormFieldLabel,
  OptionChips,
} from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import type { Category, IncomeSource } from '@/shared/types';
import type { TransactionListFilters } from '../utils/transactionFilters';
import { FilterEntityPicker } from './FilterEntityPicker.component';
import { useTransactionFilters } from '../hooks/useTransactionFilters.hook';
import { createStyles } from './TransactionFilters.styles';

const TYPE_OPTIONS = ['all', 'expense', 'income'] as const;
const DATE_OPTIONS = ['all', 'this_month', 'last_30', 'custom'] as const;

function typeLabel(v: (typeof TYPE_OPTIONS)[number]) {
  if (v === 'all') return 'All';
  if (v === 'expense') return 'Expense';
  return 'Income';
}

/** Short labels so 4-segment control never wraps / deforms. */
function dateLabel(v: (typeof DATE_OPTIONS)[number]) {
  if (v === 'all') return 'All';
  if (v === 'this_month') return 'Month';
  if (v === 'last_30') return '30 days';
  return 'Custom';
}

interface Props {
  filters: TransactionListFilters;
  onChange: (next: TransactionListFilters) => void;
  onApply: () => void;
  onClear: () => void;
  categories: Category[];
  sources: IncomeSource[];
}

export function TransactionFilters({
  filters,
  onChange,
  onApply,
  onClear,
  categories,
  sources,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    showCategory,
    showSource,
    showPayment,
    showTags,
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
  } = useTransactionFilters(filters, onChange, categories, sources);

  return (
    <View style={styles.wrap}>
      {/* Fixed type/date/payment sets. OptionChips renders them; they do not grow. */}
      <View style={styles.block}>
        <FormFieldLabel>Type</FormFieldLabel>
        <OptionChips
          options={[...TYPE_OPTIONS]}
          value={filters.type}
          onChange={handleTypeChange}
          getLabel={typeLabel}
        />
      </View>

      <View style={styles.block}>
        <FormFieldLabel>Date</FormFieldLabel>
        <OptionChips
          options={[...DATE_OPTIONS]}
          value={filters.datePreset}
          onChange={handleDatePresetChange}
          getLabel={dateLabel}
        />
      </View>

      {filters.datePreset === 'custom' ? (
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <DateInput
              label="From"
              value={filters.startDate ?? ''}
              onChange={handleStartDateChange}
              minimumDate={fromBounds.minimumDate}
              maximumDate={fromBounds.maximumDate}
            />
          </View>
          <View style={styles.dateField}>
            <DateInput
              label="To"
              value={filters.endDate ?? ''}
              onChange={handleEndDateChange}
              minimumDate={toBounds.minimumDate}
              maximumDate={toBounds.maximumDate}
            />
          </View>
        </View>
      ) : null}

      {showCategory ? (
        <FilterEntityPicker
          label="Category"
          allLabel="All categories"
          value={filters.categoryId}
          options={categoryOptions}
          onChange={handleCategoryChange}
        />
      ) : null}

      {showSource ? (
        <FilterEntityPicker
          label="Income source"
          allLabel="All sources"
          value={filters.incomeSourceId}
          options={sourceOptions}
          onChange={handleSourceChange}
        />
      ) : null}

      {showTags ? (
        <FilterEntityPicker
          label="Tag"
          allLabel="All tags"
          value={filters.tag}
          options={tagOptions}
          onChange={handleTagChange}
        />
      ) : null}

      {showPayment ? (
        <View style={styles.block}>
          <FormFieldLabel>Payment</FormFieldLabel>
          <OptionChips
            options={paymentOptions}
            value={filters.paymentMethod ?? ''}
            onChange={handlePaymentChange}
            getLabel={paymentLabel}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onClear}
          hitSlop={8}
          style={({ pressed }) => [styles.clearBtn, pressed && styles.clearBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
        >
          <Text style={styles.clearText}>Clear filters</Text>
        </Pressable>
        <Pressable
          onPress={onApply}
          style={({ pressed }) => [styles.applyBtn, pressed && styles.applyBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel="Apply filters"
        >
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
}
