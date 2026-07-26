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
} from '@/shared/components/ui';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useCreateBudget, type BudgetForm } from '@/features/budgets/hooks/useCreateBudget';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { alertThresholdRules, amountRules, dateRules, maxLen, textRules, validateBoundedDate, ValidationMessages } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

const PERIODS = ['monthly', 'weekly', 'custom'] as const;

export default function AddBudgetScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError } = useCreateBudget();

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
    },
  });

  const budgetType = watch('type');
  const startDateValue = watch('startDate');
  const endDateValue = watch('endDate');
  const categoryItems = [
    { id: '__all__', label: 'All spending' },
    ...(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined })),
  ];

  return (
    <FormStackScreen eyebrow="Budget" title="Create Budget" subtitle="Set a spending limit">
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Budget details" subtitle="Name, period, and limit">
        <Controller
          control={control}
          name="name"
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Budget name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" placeholder="e.g. Groceries" disabled={loading} />
          )}
        />

        <FormFieldLabel>Period</FormFieldLabel>
        <OptionChips
          options={PERIODS}
          value={budgetType}
          onChange={(v) => {
            setValue('type', v);
            if (v !== 'custom') clearErrors('endDate');
          }}
          getLabel={(v) => (v === 'custom' ? 'Custom' : v.charAt(0).toUpperCase() + v.slice(1))}
          disabled={loading}
        />

        <Controller
          control={control}
          name="amount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Budget amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" placeholder="0.00" disabled={loading} />
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
            return (
              <DateInput
                label="Start date"
                value={value}
                onChange={(next) => {
                  onChange(next);
                  if (endDateValue && endDateValue < next) {
                    setValue('endDate', next);
                    clearErrors('endDate');
                  }
                }}
                error={errors.startDate?.message}
                disabled={loading}
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
                  disabled={loading}
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
            <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" disabled={loading} error={errors.alertThreshold?.message} />
          )}
        />

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
              disabled={loading}
            />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Create Budget" onPrimary={handleSubmit(create)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
