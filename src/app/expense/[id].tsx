import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  DateInput,
  DetailSkeleton,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  FormActions,
  DetailActions,
  DetailHero,
  DetailMetaList,
  FormErrorBanner,
  FormInfoBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useExpenseDetail, type ExpenseForm } from '@/features/expenses/hooks/useExpenseDetail';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { ValidationMessages, amountRules, dateRules, maxLen, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';

export default function ExpenseDetailScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    expense,
    isLoading,
    editing,
    setEditing,
    loading,
    startEditing,
    update,
    duplicate,
    confirmDelete,
    submitError,
    submitInfo,
    submitSuccess,
  } = useExpenseDetail(id);

  const { data: categories } = useCategoryOptions();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: { amount: '', merchant: '', notes: '', categoryId: '', paymentMethod: 'upi', date: '' },
  });

  const selectedPayment = watch('paymentMethod');

  if (isLoading || !expense) {
    return (
      <FormStackScreen eyebrow="Expense" title="Expense" subtitle="Loading details">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  const title = expense.merchant ?? expense.category?.name ?? 'Expense';
  const amount = formatCurrency(Number(expense.amount), expense.currency);

  return (
    <FormStackScreen
      eyebrow="Expense"
      title={editing ? 'Edit Expense' : title}
      subtitle={editing ? 'Update transaction' : expense.category?.name}
    >
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      {submitInfo ? <FormInfoBanner message={submitInfo} icon="link" /> : null}
      {submitSuccess ? <FormSuccessBanner message={submitSuccess} /> : null}

      {!editing ? (
        <>
          <DetailHero
            amount={amount}
            amountColor={theme.colors.danger}
            title={title}
            subtitle={expense.category?.name && expense.merchant ? expense.category.name : undefined}
          />
          <DetailMetaList
            rows={[
              { label: 'Date', value: expense.date },
              { label: 'Payment', value: expense.paymentMethod?.replace(/_/g, ' ') ?? '' },
              { label: 'Notes', value: expense.notes ?? '' },
            ]}
          />
          <DetailActions
            primaryTitle="Edit"
            onPrimary={() => startEditing(reset)}
            secondaryTitle="Duplicate"
            onSecondary={duplicate}
            secondaryLoading={loading}
            onDestructive={confirmDelete}
            destructiveLoading={loading}
          />
        </>
      ) : (
        <>
          <FormSection title="Amount & details">
            <Controller
              control={control}
              name="amount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="expense" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="merchant"
              rules={textRules('merchant')}
              render={({ field: { onChange, value } }) => (
                <Input label="Merchant" maxLength={maxLen('merchant')} value={value} onChangeText={onChange} error={errors.merchant?.message} leftIcon="activity" disabled={loading} />
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
              options={PAYMENT_METHODS.map((pm) => pm.value)}
              value={selectedPayment}
              onChange={(v) => setValue('paymentMethod', v)}
              getLabel={(v) => PAYMENT_METHODS.find((pm) => pm.value === v)?.label ?? v}
              disabled={loading}
            />
            <FormFieldLabel>Category</FormFieldLabel>
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
                  disabled={loading}
                />
              )}
            />
          </FormSection>

          <FormSection title="Notes">
            <Controller
              control={control}
              name="notes"
              rules={optionalTextRules('notes')}
              render={({ field: { onChange, value } }) => (
                <Input label="Notes" maxLength={maxLen('notes')} value={value} onChangeText={onChange} multiline placeholder="Optional notes" disabled={loading} error={errors.notes?.message} />
              )}
            />
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSubmit(update)}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </>
      )}
    </FormStackScreen>
  );
}
