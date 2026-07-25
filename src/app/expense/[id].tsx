import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  DateInput,
  DetailSkeleton,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  FormActions,
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
import { amountRules, dateRules, maxLen, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';

export default function ExpenseDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const selectedCategory = watch('categoryId');
  const selectedPayment = watch('paymentMethod');

  if (isLoading || !expense) {
    return <DetailSkeleton />;
  }

  const symbol = formatCurrency(Number(expense.amount), expense.currency);

  return (
    <FormStackScreen
      eyebrow="EXPENSE"
      title={editing ? 'Edit Expense' : 'Expense Details'}
      subtitle={expense.merchant ?? expense.category?.name ?? 'Transaction'}
    >
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      {submitInfo ? <FormInfoBanner message={submitInfo} icon="link" /> : null}
      {submitSuccess ? <FormSuccessBanner message={submitSuccess} /> : null}

      {!editing ? (
        <>
          <FormSection title="Summary">
            <Text style={styles.amount}>{symbol}</Text>
            <Text style={styles.merchant}>{expense.merchant ?? expense.category?.name ?? 'Expense'}</Text>
            <Text style={styles.meta}>Date: {expense.date}</Text>
            <Text style={styles.meta}>Payment: {expense.paymentMethod?.replace('_', ' ') ?? '—'}</Text>
            {expense.notes ? <Text style={styles.notes}>{expense.notes}</Text> : null}
          </FormSection>
          <FormActions primaryTitle="Edit" onPrimary={() => startEditing(reset)} />
          <Button title="Duplicate" onPress={duplicate} variant="outline" loading={loading} />
          <Button title="Delete" onPress={confirmDelete} variant="danger" loading={loading} />
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
            <OptionChipList
              items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
              selectedId={selectedCategory}
              onSelect={(catId) => setValue('categoryId', catId)}
              disabled={loading}
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    amount: { fontSize: 32, fontWeight: '800', color: t.colors.danger },
    merchant: { fontSize: 18, fontWeight: '600', color: t.colors.text, marginTop: 8 },
    meta: { fontSize: 14, color: t.colors.textSecondary, marginTop: 4 },
    notes: { fontSize: 14, color: t.colors.text, marginTop: 12, lineHeight: 20 },
  });
}
