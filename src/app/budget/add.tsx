import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Input,
  DateInput,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
} from '@/shared/components/ui';
import { apiGet } from '@/shared/services/api';
import { useCreateBudget, type BudgetForm } from '@/features/budgets/hooks/useCreateBudget';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import type { Category } from '@/shared/types';

export default function AddBudgetScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Budget Name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="budgets" />
        )}
      />

      <FormFieldLabel>Budget Type</FormFieldLabel>
      <OptionChips
        options={['monthly', 'weekly', 'category'] as const}
        value={budgetType}
        onChange={(v) => setValue('type', v)}
      />

      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Budget Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, value } }) => (
          <DateInput label="Start Date" value={value} onChange={onChange} />
        )}
      />

      <Controller
        control={control}
        name="alertThreshold"
        render={({ field: { onChange, value } }) => (
          <Input label="Alert Threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" />
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

      <Button title="Create Budget" onPress={handleSubmit(create)} loading={loading} size="lg" />
    </FormStackScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({});
}
