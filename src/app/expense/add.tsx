import { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Pressable, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, DateInput, DashedBorder, useScrollContentStyle } from '@/shared/components/ui';
import { apiGet } from '@/shared/services/api';
import { useCreateExpense, type ExpenseForm } from '@/features/expenses/hooks/useCreateExpense';
import { useReceiptPicker } from '@/features/expenses/hooks/useReceiptPicker';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import type { Category } from '@/shared/types';

export default function AddExpenseScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { create, loading } = useCreateExpense();
  const { receipt, pick } = useReceiptPicker();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

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
    const result = await create(data, receipt);
    if (!result.ok) {
      if (result.error === 'validation') {
        Alert.alert('Category Required', 'Please select a category');
      } else if (result.error === 'offline') {
        Alert.alert('Saved Offline', 'Could not reach server. Expense queued for sync.');
      }
      return;
    }
    if (result.offline) {
      Alert.alert('Saved Offline', 'Expense will sync when you reconnect.');
    }
  };

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="merchant"
        render={({ field: { onChange, value } }) => (
          <Input label="Merchant" value={value} onChangeText={onChange} placeholder="e.g. Swiggy, Amazon" />
        )}
      />

      <Controller
        control={control}
        name="date"
        rules={{ required: 'Date is required' }}
        render={({ field: { onChange, value } }) => (
          <DateInput label="Date" value={value} onChange={onChange} error={errors.date?.message} />
        )}
      />

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.categoryGrid}>
        {PAYMENT_METHODS.map((pm) => (
          <Pressable
            key={pm.value}
            onPress={() => setValue('paymentMethod', pm.value)}
            style={[
              styles.categoryChip,
              selectedPayment === pm.value && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
            ]}
          >
            <Text style={[styles.categoryText, selectedPayment === pm.value && styles.categoryTextActive]}>{pm.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {categories?.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setValue('categoryId', cat.id)}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && { backgroundColor: cat.color ?? theme.colors.primary, borderColor: cat.color ?? theme.colors.primary },
            ]}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Receipt (optional)</Text>
      <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="Attach receipt">
        <DashedBorder width="100%" height={120} borderRadius={12} color={theme.colors.border} style={styles.receiptPicker}>
          {receipt ? (
            <Image source={{ uri: receipt.uri }} style={styles.receiptPreview} resizeMode="contain" />
          ) : (
            <Text style={styles.receiptPlaceholder}>Tap to attach JPG/PNG receipt</Text>
          )}
        </DashedBorder>
      </Pressable>

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, value } }) => (
          <Input label="Notes" value={value} onChangeText={onChange} placeholder="Optional notes" />
        )}
      />

      <Button title="Save Expense" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    categoryText: { fontSize: 13, color: t.colors.text },
    categoryTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
    receiptPicker: {
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.colors.surface,
    },
    receiptPreview: {
      width: '100%',
      height: 120,
      maxHeight: 120,
    },
    receiptPlaceholder: { color: t.colors.textSecondary, fontSize: 14 },
  });
}
