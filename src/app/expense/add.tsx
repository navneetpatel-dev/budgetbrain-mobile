import { useEffect } from 'react';
import { Text, View } from 'react-native';
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
  FormErrorBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useCreateExpense, type ExpenseForm } from '@/features/expenses/hooks/useCreateExpense';
import { useReceiptPicker } from '@/features/expenses/hooks/useReceiptPicker';
import { useCategorySuggestion } from '@/features/expenses/hooks/useCategorySuggestion';
import { useExpenseTagSuggestions } from '@/features/expenses/hooks/useExpenseTagSuggestions';
import { TagInput } from '@/features/expenses/components/TagInput';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { ValidationMessages, amountRules, dateRules, maxLen, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds, toIsoDate } from '@/shared/utils/dateBounds';

export default function AddExpenseScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const { create, loading, submitError, justSaved } = useCreateExpense();
  const disabled = loading || justSaved;
  const { receipt, pick, clear } = useReceiptPicker();
  const { suggestedCategoryId, suggest } = useCategorySuggestion();
  const { suggestions: tagSuggestions } = useExpenseTagSuggestions();

  const { data: categories } = useCategoryOptions();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: {
      amount: '',
      merchant: '',
      notes: '',
      categoryId: '',
      paymentMethod: 'upi',
      date: toIsoDate(new Date()),
      tags: [],
    },
  });

  const selectedPayment = watch('paymentMethod');
  const currentCategoryId = watch('categoryId');

  const onMerchantBlur = async (merchant: string) => {
    if (currentCategoryId) return;
    await suggest(merchant);
  };

  useEffect(() => {
    if (suggestedCategoryId && !currentCategoryId) {
      setValue('categoryId', suggestedCategoryId);
    }
  }, [suggestedCategoryId, currentCategoryId, setValue]);

  const onSubmit = async (data: ExpenseForm) => {
    await create(data, receipt);
  };

  return (
    <FormStackScreen eyebrow="Expense" title="Add Expense" subtitle="Log a new transaction">
      {justSaved ? <FormSuccessBanner message="Expense saved" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
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
              disabled={disabled}
            />
          )}
        />

        <Controller
          control={control}
          name="merchant"
          rules={textRules('merchant')}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Merchant"
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                void onMerchantBlur(value);
              }}
              maxLength={maxLen('merchant')}
              placeholder="e.g. Swiggy, Amazon"
              error={errors.merchant?.message}
              leftIcon="activity"
              disabled={disabled}
            />
          )}
        />

        <Controller
          control={control}
          name="date"
          rules={dateRules()}
          render={({ field: { onChange, value } }) => {
            const b = DateBounds.transaction(value);
            return (
              <DateInput
                label="Date"
                value={value}
                onChange={onChange}
                error={errors.date?.message}
                disabled={disabled}
                minimumDate={b.minimumDate}
                maximumDate={b.maximumDate}
              />
            );
          }}
        />
      </FormSection>

      <FormSection title="Payment & category">
        <FormFieldLabel>Payment method</FormFieldLabel>
        <OptionChips
          options={PAYMENT_METHODS.map((p) => p.value)}
          value={selectedPayment}
          onChange={(v) => setValue('paymentMethod', v)}
          getLabel={(v) => PAYMENT_METHODS.find((p) => p.value === v)?.label ?? v}
          disabled={disabled}
        />

        <View style={{ marginTop: theme.spacing.lg }}>
          <FormFieldLabel>Category</FormFieldLabel>
          {suggestedCategoryId && currentCategoryId === suggestedCategoryId ? (
            <Text style={{ ...theme.typography.caption, fontWeight: '600', color: theme.colors.primary, marginBottom: 8 }}>
              Suggested from your history with this merchant
            </Text>
          ) : null}
          <Controller
            control={control}
            name="categoryId"
            rules={{ required: ValidationMessages.categoryRequired }}
            render={({ field: { onChange, value } }) => (
              <OptionChipList
                items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
                selectedId={value}
                onSelect={onChange}
                error={errors.categoryId?.message}
                disabled={disabled}
              />
            )}
          />
        </View>

        <View style={{ marginTop: theme.spacing.lg }}>
          <Controller
            control={control}
            name="tags"
            render={({ field: { onChange, value } }) => (
              <TagInput value={value} onChange={onChange} suggestions={tagSuggestions} disabled={disabled} />
            )}
          />
        </View>
      </FormSection>

      <FormSection title="Extras" subtitle="Optional attachments and notes">
        <ImageUploadField
          label="Receipt"
          hint="Attach a photo of your receipt"
          imageUri={receipt?.uri}
          onPick={pick}
          onRemove={clear}
          disabled={disabled}
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
              disabled={disabled}
            />
          )}
        />
      </FormSection>

      <FormActions primaryTitle="Save Expense" onPrimary={handleSubmit(onSubmit)} primaryLoading={loading} />
    </FormStackScreen>
  );
}
