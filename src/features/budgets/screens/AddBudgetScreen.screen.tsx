import { useMemo } from 'react';
import { Text, View, Switch } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import {
  Input,
  DateInput,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  FormActions,
  FormErrorBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions.hook';
import { useCreateBudget, type BudgetForm } from '@/features/budgets/hooks/useCreateBudget.hook';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency.hook';
import { alertThresholdRules, amountRules, dateRules, maxLen, textRules, validateBoundedDate, ValidationMessages } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';
import { createStyles } from './AddBudgetScreen.styles';

const PERIODS = ['monthly', 'weekly', 'custom'] as const;

export function AddBudgetScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError, justSaved } = useCreateBudget();
  const disabled = loading || justSaved;

  const { data: categories } = useCategoryOptions();

  const now = new Date();
  const monthStart = toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));

  const { control, handleSubmit, setValue, watch, clearErrors, formState: { errors } } = useForm<BudgetForm>({
    defaultValues: {
      name: '',
      type: 'monthly',
      amount: '',
      categoryId: '__all__',
      startDate: monthStart,
      endDate: '',
      alertThreshold: '80',
      rollover: false,
    },
  });

  const budgetType = watch('type');
  const startDateValue = watch('startDate');
  const endDateValue = watch('endDate');
  const handlePeriodChange = (period: (typeof PERIODS)[number]) => {
    setValue('type', period);
    if (period !== 'custom') clearErrors('endDate');
  };
  const periodLabel = (period: (typeof PERIODS)[number]) =>
    period === 'custom' ? 'Custom' : period.charAt(0).toUpperCase() + period.slice(1);
  // OptionChipList hosts this category set.
  const categoryItems = [
    { id: '__all__', label: 'All spending' },
    ...(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined })),
  ];

  return (
    <FormStackScreen eyebrow="Budget" title="Create Budget" subtitle="Set a spending limit">
      {justSaved ? <FormSuccessBanner message="Budget created" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Budget details" subtitle="Name, period, and limit">
        <Controller
          control={control}
          name="name"
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Budget name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" placeholder="e.g. Groceries" disabled={disabled} />
          )}
        />

        <FormFieldLabel>Period</FormFieldLabel>
        <OptionChips
          options={[...PERIODS]}
          value={budgetType}
          onChange={handlePeriodChange}
          getLabel={periodLabel}
          disabled={disabled}
        />

        <Controller
          control={control}
          name="amount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Budget amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" placeholder="0.00" disabled={disabled} />
          )}
        />
      </FormSection>

      <FormSection title="Schedule & alerts">
        <Controller
          control={control}
          name="startDate"
          rules={dateRules('budgetStart')}
          render={({ field: { onChange, value } }) => {
            const b = DateBounds.budgetStart(value);
            const handleStartChange = (next: string) => {
              onChange(next);
              if (endDateValue && endDateValue < next) {
                setValue('endDate', next);
                clearErrors('endDate');
              }
            };
            return (
              <DateInput
                label="Start date"
                value={value}
                onChange={handleStartChange}
                error={errors.startDate?.message}
                disabled={disabled}
                minimumDate={b.minimumDate}
                maximumDate={b.maximumDate}
              />
            );
          }}
        />

        {budgetType === 'custom' ? (
          <Controller
            control={control}
            name="endDate"
            rules={{
              validate: (v, form) => {
                if (!v) return ValidationMessages.endDateRequired;
                return validateBoundedDate('budgetEnd', v, { startDate: form.startDate }) ?? true;
              },
            }}
            render={({ field: { onChange, value } }) => {
              const b = DateBounds.budgetEnd(startDateValue, value);
              return (
                <DateInput
                  label="End date"
                  value={value}
                  onChange={onChange}
                  error={errors.endDate?.message}
                  disabled={disabled}
                  minimumDate={b.minimumDate}
                  maximumDate={b.maximumDate}
                />
              );
            }}
          />
        ) : null}

        <Controller
          control={control}
          name="alertThreshold"
          rules={alertThresholdRules()}
          render={({ field: { onChange, value } }) => (
            <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" disabled={disabled} error={errors.alertThreshold?.message} />
          )}
        />

        {budgetType !== 'custom' ? (
          <View style={styles.rolloverRow}>
            <View style={styles.rolloverCopy}>
              <Text style={styles.rolloverTitle}>Roll over unused amount</Text>
              <Text style={styles.rolloverCaption}>
                {"Carry last period's leftover (or deficit) into this one"}
              </Text>
            </View>
            <Controller
              control={control}
              name="rollover"
              render={({ field: { onChange, value } }) => (
                <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.colors.primary }} disabled={disabled} />
              )}
            />
          </View>
        ) : null}

        <FormFieldLabel>Category (optional)</FormFieldLabel>
        <Controller
          control={control}
          name="categoryId"
          render={({ field: { onChange, value } }) => (
            <OptionChipList
              items={categoryItems}
              selectedId={value}
              onSelect={onChange}
              error={errors.categoryId?.message}
              disabled={disabled}
            />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Create Budget" onPrimary={handleSubmit(create)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
