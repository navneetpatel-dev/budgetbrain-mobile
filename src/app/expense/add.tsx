import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable, Image, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Input,
  DateInput,
  DashedBorder,
  useScrollContentStyle,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
} from '@/shared/components/ui';
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
    <ScrollView style={styles.container} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="expense" />
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

      <FormFieldLabel>Payment Method</FormFieldLabel>
      <OptionChips
        options={PAYMENT_METHODS.map((p) => p.value)}
        value={selectedPayment}
        onChange={(v) => setValue('paymentMethod', v)}
        getLabel={(v) => PAYMENT_METHODS.find((p) => p.value === v)?.label ?? v}
      />

      <FormFieldLabel>Category</FormFieldLabel>
      <OptionChipList
        items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
        selectedId={selectedCategory}
        onSelect={(id) => setValue('categoryId', id)}
      />

      <FormFieldLabel>Receipt (optional)</FormFieldLabel>
      <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="Attach receipt">
        <DashedBorder width="100%" height={120} borderRadius={12} color={theme.colors.border} style={styles.receiptPicker}>
          {receipt ? (
            <Image source={{ uri: receipt.uri }} style={styles.receiptPreview} resizeMode="contain" />
          ) : (
            <View style={styles.receiptPlaceholderWrap}>
              <Text style={styles.receiptPlaceholder}>Tap to attach JPG/PNG receipt</Text>
            </View>
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

      <Button title="Save Expense" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    receiptPicker: {
      marginBottom: t.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.03)' : t.colors.surface,
    },
    receiptPreview: { width: '100%', height: 120, maxHeight: 120 },
    receiptPlaceholderWrap: { padding: t.spacing.lg },
    receiptPlaceholder: { color: t.colors.textSecondary, fontSize: 14, textAlign: 'center' },
  });
}
