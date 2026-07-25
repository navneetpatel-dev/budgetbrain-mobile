import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  DateInput,
  FormFieldLabel,
  OptionChips,
} from '@/shared/components/ui';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import type { Category, IncomeSource } from '@/shared/types';
import type {
  DatePreset,
  TransactionListFilters,
  TransactionTypeFilter,
} from '../utils/transactionFilters';
import { FilterEntityPicker } from './FilterEntityPicker';

const TYPE_OPTIONS: TransactionTypeFilter[] = ['all', 'expense', 'income'];
const DATE_OPTIONS: DatePreset[] = ['all', 'this_month', 'last_30', 'custom'];

function typeLabel(v: TransactionTypeFilter) {
  if (v === 'all') return 'All';
  if (v === 'expense') return 'Expense';
  return 'Income';
}

/** Short labels so 4-segment control never wraps / deforms. */
function dateLabel(v: DatePreset) {
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

  const patch = (partial: Partial<TransactionListFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <FormFieldLabel>Type</FormFieldLabel>
        <OptionChips
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(type) =>
            patch({
              type,
              categoryId: type === 'income' ? undefined : filters.categoryId,
              incomeSourceId: type === 'expense' ? undefined : filters.incomeSourceId,
              paymentMethod: type === 'income' ? undefined : filters.paymentMethod,
            })
          }
          getLabel={typeLabel}
        />
      </View>

      <View style={styles.block}>
        <FormFieldLabel>Date</FormFieldLabel>
        <OptionChips
          options={DATE_OPTIONS}
          value={filters.datePreset}
          onChange={(datePreset) =>
            patch({
              datePreset,
              startDate: datePreset === 'custom' ? filters.startDate : undefined,
              endDate: datePreset === 'custom' ? filters.endDate : undefined,
            })
          }
          getLabel={dateLabel}
        />
      </View>

      {filters.datePreset === 'custom' ? (
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <DateInput
              label="From"
              value={filters.startDate ?? ''}
              onChange={(startDate) => patch({ startDate })}
            />
          </View>
          <View style={styles.dateField}>
            <DateInput
              label="To"
              value={filters.endDate ?? ''}
              onChange={(endDate) => patch({ endDate })}
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
          onChange={(categoryId) => patch({ categoryId })}
        />
      ) : null}

      {showSource ? (
        <FilterEntityPicker
          label="Income source"
          allLabel="All sources"
          value={filters.incomeSourceId}
          options={sourceOptions}
          onChange={(incomeSourceId) => patch({ incomeSourceId })}
        />
      ) : null}

      {showPayment ? (
        <View style={styles.block}>
          <FormFieldLabel>Payment</FormFieldLabel>
          <OptionChips
            options={paymentOptions}
            value={filters.paymentMethod ?? ''}
            onChange={(paymentMethod) => patch({ paymentMethod: paymentMethod || undefined })}
            getLabel={(id) =>
              id
                ? (PAYMENT_METHODS.find((p) => p.value === id)?.label ?? id)
                : 'All methods'
            }
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onClear}
          hitSlop={8}
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.75 }]}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
        >
          <Text style={styles.clearText}>Clear filters</Text>
        </Pressable>
        <Pressable
          onPress={onApply}
          style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
          accessibilityLabel="Apply filters"
        >
          <Text style={styles.applyText}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: { gap: 8, paddingBottom: 0 },
    block: { gap: 6 },
    dateRow: { flexDirection: 'row', gap: t.spacing.sm },
    dateField: { flex: 1 },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.sm,
      marginTop: 4,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.borderSubtle,
    },
    clearBtn: {
      paddingVertical: 4,
      paddingRight: 8,
    },
    clearText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    applyBtn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.primary,
    },
    applyText: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.onPrimary,
    },
  });
}
