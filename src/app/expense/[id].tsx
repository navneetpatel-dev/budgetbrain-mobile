import { useMemo } from 'react';
import { StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Card,
  DateInput,
  ScreenLoader,
  useScrollContentStyle,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  GroupedCard,
} from '@/shared/components/ui';
import { apiGet } from '@/shared/services/api';
import { useExpenseDetail, type ExpenseForm } from '@/features/expenses/hooks/useExpenseDetail';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { Category } from '@/shared/types';

export default function ExpenseDetailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  } = useExpenseDetail(id);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const { control, handleSubmit, setValue, watch, reset } = useForm<ExpenseForm>({
    defaultValues: { amount: '', merchant: '', notes: '', categoryId: '', paymentMethod: 'upi', date: '' },
  });

  const selectedCategory = watch('categoryId');
  const selectedPayment = watch('paymentMethod');

  const onSave = async (data: ExpenseForm) => {
    const result = await update(data);
    if (result.ok && result.offline) {
      Alert.alert('Saved Offline', 'Changes will sync when you reconnect.');
    } else if (!result.ok) {
      Alert.alert('Error', 'Could not update expense');
    }
  };

  const handleDuplicate = async () => {
    const result = await duplicate();
    if (result.ok) {
      Alert.alert('Duplicated', 'A copy of this expense was created.');
    } else {
      Alert.alert('Error', 'Could not duplicate expense');
    }
  };

  if (isLoading || !expense) {
    return <ScreenLoader />;
  }

  const symbol = formatCurrency(Number(expense.amount), expense.currency);
  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      {!editing ? (
        <>
          <GroupedCard title="DETAILS">
            <Text style={styles.amount}>{symbol}</Text>
            <Text style={styles.merchant}>{expense.merchant ?? expense.category?.name ?? 'Expense'}</Text>
            <Text style={styles.meta}>Date: {expense.date}</Text>
            <Text style={styles.meta}>Payment: {expense.paymentMethod?.replace('_', ' ') ?? '—'}</Text>
            {expense.notes && <Text style={styles.notes}>{expense.notes}</Text>}
          </GroupedCard>
          <Button title="Edit" onPress={() => startEditing(reset)} />
          <Button title="Duplicate" onPress={handleDuplicate} variant="outline" loading={loading} />
          <Button title="Delete" onPress={confirmDelete} variant="danger" loading={loading} />
        </>
      ) : (
        <>
          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Amount" value={value} onChangeText={onChange} keyboardType="numeric" />
            )}
          />
          <Controller
            control={control}
            name="merchant"
            render={({ field: { onChange, value } }) => (
              <Input label="Merchant" value={value} onChangeText={onChange} />
            )}
          />
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <DateInput label="Date" value={value} onChange={onChange} />
            )}
          />
          <FormFieldLabel>Payment Method</FormFieldLabel>
          <OptionChips
            options={PAYMENT_METHODS.map((pm) => pm.value)}
            value={selectedPayment}
            onChange={(v) => setValue('paymentMethod', v)}
            getLabel={(v) => PAYMENT_METHODS.find((pm) => pm.value === v)?.label ?? v}
          />
          <FormFieldLabel>Category</FormFieldLabel>
          <OptionChipList
            items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
            selectedId={selectedCategory}
            onSelect={(id) => setValue('categoryId', id)}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input label="Notes" value={value} onChangeText={onChange} />
            )}
          />
          <Button title="Save Changes" onPress={handleSubmit(onSave)} loading={loading} size="lg" />
          <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" />
        </>
      )}
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    amount: { fontSize: 32, fontWeight: '800', color: t.colors.danger },
    merchant: { fontSize: 18, fontWeight: '600', color: t.colors.text, marginTop: 8 },
    meta: { fontSize: 14, color: t.colors.textSecondary, marginTop: 4 },
    notes: { fontSize: 14, color: t.colors.text, marginTop: 12 },
  });
}
