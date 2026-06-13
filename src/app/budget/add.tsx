import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Input,
  DateInput,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  FormActions,
} from '@/shared/components/ui';
import { apiGet } from '@/shared/services/api';
import { useCreateBudget, type BudgetForm } from '@/features/budgets/hooks/useCreateBudget';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import type { Category } from '@/shared/types';

export default function AddBudgetScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading } = useCreateBudget();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

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
      <FormSection title="Budget details" subtitle="Name, type, and limit">
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Budget name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" placeholder="e.g. Groceries" />
          )}
        />

        <FormFieldLabel>Budget type</FormFieldLabel>
        <OptionChips
          options={['monthly', 'weekly', 'category'] as const}
          value={budgetType}
          onChange={(v) => setValue('type', v)}
          getLabel={(v) => (v === 'category' ? 'By category' : v.charAt(0).toUpperCase() + v.slice(1))}
        />

        <Controller
          control={control}
          name="amount"
          rules={{ required: 'Amount is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Budget amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="wallet" placeholder="0.00" />
          )}
        />
      </FormSection>

      <FormSection title="Schedule & alerts">
        <Controller
          control={control}
          name="startDate"
          render={({ field: { onChange, value } }) => (
            <DateInput label="Start date" value={value} onChange={onChange} />
          )}
        />

        <Controller
          control={control}
          name="alertThreshold"
          render={({ field: { onChange, value } }) => (
            <Input label="Alert threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" helperText="Notify when spending reaches this %" leftIcon="bell" />
          )}
        />

        {budgetType === 'category' && (
          <>
            <FormFieldLabel>Category</FormFieldLabel>
            <OptionChipList
              items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
              selectedId={selectedCategory}
              onSelect={(id) => setValue('categoryId', id)}
            />
          </>
        )}
      </FormSection>

      <FormActions primaryTitle="Create Budget" onPrimary={handleSubmit(create)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
