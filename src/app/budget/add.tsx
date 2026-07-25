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
import { amountRules, textRules } from '@/shared/validation/fieldLimits';

export default function AddBudgetScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError } = useCreateBudget();

  const { data: categories } = useCategoryOptions();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<BudgetForm>({
    defaultValues: {
      name: '',
      type: 'monthly',
      amount: '',
      categoryId: '',
      startDate: monthStart,
      alertThreshold: '80',
    },
  });

  const budgetType = watch('type');
  const selectedCategory = watch('categoryId');

  return (
    <FormStackScreen eyebrow="BUDGET" title="Create Budget" subtitle="Set a spending limit">
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      <FormSection title="Budget details" subtitle="Name, type, and limit">
        <Controller
          control={control}
          name="name"
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Budget name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" placeholder="e.g. Groceries" disabled={loading} />
          )}
        />

        <FormFieldLabel>Budget type</FormFieldLabel>
        <OptionChips
          options={['monthly', 'weekly', 'category'] as const}
          value={budgetType}
          onChange={(v) => setValue('type', v)}
          getLabel={(v) => (v === 'category' ? 'By category' : v.charAt(0).toUpperCase() + v.slice(1))}
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
          render={({ field: { onChange, value } }) => (
            <DateInput label="Start date" value={value} onChange={onChange} disabled={loading} />
          )}
        />

        <Controller
          control={control}
          name="alertThreshold"
          render={({ field: { onChange, value } }) => (
            <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" disabled={loading} />
          )}
        />

        {budgetType === 'category' && (
          <>
            <FormFieldLabel>Category</FormFieldLabel>
            <OptionChipList
              items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
              selectedId={selectedCategory}
              onSelect={(id) => setValue('categoryId', id)}
              disabled={loading}
            />
          </>
        )}
      </FormSection>

      <FormActions primaryTitle="Create Budget" onPrimary={handleSubmit(create)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
