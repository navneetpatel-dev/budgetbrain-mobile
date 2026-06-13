import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Card, DateInput, ScreenLoader, useScrollContentStyle } from '@/shared/components/ui';
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
          <Card>
            <Text style={styles.amount}>{symbol}</Text>
            <Text style={styles.merchant}>{expense.merchant ?? expense.category?.name ?? 'Expense'}</Text>
            <Text style={styles.meta}>Date: {expense.date}</Text>
            <Text style={styles.meta}>Payment: {expense.paymentMethod?.replace('_', ' ') ?? '—'}</Text>
            {expense.notes && <Text style={styles.notes}>{expense.notes}</Text>}
          </Card>
          <Button title="Edit" onPress={() => startEditing(reset)} />
          <View style={styles.spacer} />
          <Button title="Duplicate" onPress={handleDuplicate} variant="outline" loading={loading} />
          <View style={styles.spacer} />
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
          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.chipRow}>
            {PAYMENT_METHODS.map((pm) => (
              <Pressable
                key={pm.value}
                onPress={() => setValue('paymentMethod', pm.value)}
                style={[styles.chip, selectedPayment === pm.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedPayment === pm.value && styles.chipTextActive]}>{pm.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories?.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setValue('categoryId', cat.id)}
                style={[styles.chip, selectedCategory === cat.id && { backgroundColor: cat.color ?? theme.colors.primary, borderColor: cat.color ?? theme.colors.primary }]}
              >
                <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input label="Notes" value={value} onChangeText={onChange} />
            )}
          />
          <Button title="Save Changes" onPress={handleSubmit(onSave)} loading={loading} />
          <View style={styles.spacer} />
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
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipText: { fontSize: 13, color: t.colors.text },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
    spacer: { height: 12 },
  });
}
