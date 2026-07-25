import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Input,
  DateInput,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  ImageUploadField,
  FormActions,
} from '@/shared/components/ui';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useCreateExpense, type ExpenseForm } from '@/features/expenses/hooks/useCreateExpense';
import { useReceiptPicker } from '@/features/expenses/hooks/useReceiptPicker';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import {
  amountRules,
  dateRules,
  maxLen,
  optionalTextRules,
  textRules,
} from '@/shared/validation/fieldLimits';

export default function AddExpenseScreen() {
  const { amountLabel } = useUserCurrency();
  const { create, loading } = useCreateExpense();
  const { receipt, pick, clear } = useReceiptPicker();
  const [categoryError, setCategoryError] = useState<string>();

  const { data: categories } = useCategoryOptions();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: {
      amount: '',
      merchant: '',
      notes: '',
      categoryId: '',
      paymentMethod: 'upi',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCategory = watch('categoryId');
  const selectedPayment = watch('paymentMethod');

  const onSubmit = async (data: ExpenseForm) => {
    if (!data.categoryId) {
      setCategoryError('Please select a category');
      return;
    }
    setCategoryError(undefined);
    await create(data, receipt);
  };

  return (
    <FormStackScreen eyebrow="EXPENSE" title="Add Expense" subtitle="Log a new transaction">
      <FormSection title="Amount & details" subtitle="Core transaction info">
        <Controller
          control={control}
          name="amount"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input
              label={amountLabel('Amount')}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={errors.amount?.message}
              leftIcon="expense"
              placeholder="0.00"
              disabled={loading}
            />
          )}
        />

        <Controller
          control={control}
          name="merchant"
          rules={textRules('merchant')}
          render={({ field: { onChange, value } }) => (
            <Input label="Merchant" value={value} onChangeText={onChange} maxLength={maxLen('merchant')} placeholder="e.g. Swiggy, Amazon" error={errors.merchant?.message} leftIcon="activity" disabled={loading} />
          )}
        />

        <Controller
          control={control}
          name="date"
          rules={dateRules()}
          render={({ field: { onChange, value } }) => (
            <DateInput label="Date" value={value} onChange={onChange} error={errors.date?.message} disabled={loading} />
          )}
        />
      </FormSection>

      <FormSection title="Payment & category">
        <FormFieldLabel>Payment method</FormFieldLabel>
        <OptionChips
          options={PAYMENT_METHODS.map((p) => p.value)}
          value={selectedPayment}
          onChange={(v) => setValue('paymentMethod', v)}
          getLabel={(v) => PAYMENT_METHODS.find((p) => p.value === v)?.label ?? v}
          disabled={loading}
        />

        <FormFieldLabel>Category</FormFieldLabel>
        <OptionChipList
          items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
          selectedId={selectedCategory}
          onSelect={(id) => {
            setValue('categoryId', id);
            setCategoryError(undefined);
          }}
          error={categoryError}
          disabled={loading}
        />
      </FormSection>

      <FormSection title="Extras" subtitle="Optional attachments and notes">
        <ImageUploadField
          label="Receipt"
          hint="Attach a photo of your receipt"
          imageUri={receipt?.uri}
          onPick={pick}
          onRemove={clear}
          disabled={loading}
        />

        <Controller
          control={control}
          name="notes"
          rules={optionalTextRules('notes')}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Notes"
              value={value}
              onChangeText={onChange}
              maxLength={maxLen('notes')}
              placeholder="Add any extra details..."
              multiline
              disabled={loading}
            />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Expense" onPrimary={handleSubmit(onSubmit)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
