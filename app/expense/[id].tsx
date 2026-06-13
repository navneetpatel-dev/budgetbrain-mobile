import { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Card } from '@/src/components/ui';
import { apiGet, apiPatch, apiDelete, apiPost } from '@/src/services/api';
import { queueOfflineAction, isOnline } from '@/src/services/offlineSync';
import { COLORS, PAYMENT_METHODS } from '@/src/constants/config';
import type { Category, Transaction } from '@/src/types';

interface ExpenseForm {
  amount: string;
  merchant: string;
  notes: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
}

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', id],
    queryFn: async () => {
      const result = await apiGet<{ transactions: Transaction[] }>('/expenses', { type: 'expense', limit: 200 });
      const found = result.transactions.find((t) => t.id === id);
      if (!found) throw new Error('Expense not found');
      return found;
    },
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const { control, handleSubmit, setValue, watch, reset } = useForm<ExpenseForm>({
    defaultValues: { amount: '', merchant: '', notes: '', categoryId: '', paymentMethod: 'upi', date: '' },
  });

  const selectedCategory = watch('categoryId');
  const selectedPayment = watch('paymentMethod');

  const startEditing = () => {
    if (!expense) return;
    reset({
      amount: String(expense.amount),
      merchant: expense.merchant ?? '',
      notes: expense.notes ?? '',
      categoryId: expense.categoryId ?? '',
      paymentMethod: expense.paymentMethod ?? 'upi',
      date: expense.date,
    });
    setEditing(true);
  };

  const onSave = async (data: ExpenseForm) => {
    setLoading(true);
    const payload = {
      id,
      amount: Number(data.amount),
      merchant: data.merchant || undefined,
      notes: data.notes || undefined,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      date: data.date,
    };
    try {
      if (!(await isOnline())) {
        queueOfflineAction('update', payload);
        Alert.alert('Saved Offline', 'Changes will sync when you reconnect.');
        setEditing(false);
        return;
      }
      await apiPatch(`/expenses/${id}`, payload);
      queryClient.invalidateQueries({ queryKey: ['expense', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Could not update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            if (!(await isOnline())) {
              queueOfflineAction('delete', { id });
              Alert.alert('Queued', 'Delete will sync when you reconnect.');
              router.back();
              return;
            }
            await apiDelete(`/expenses/${id}`);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            router.back();
          } catch {
            Alert.alert('Error', 'Could not delete expense');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await apiPost(`/expenses/${id}/duplicate`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      Alert.alert('Duplicated', 'A copy of this expense was created.');
    } catch {
      Alert.alert('Error', 'Could not duplicate expense');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !expense) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const symbol = expense.currency === 'INR' ? '₹' : expense.currency;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!editing ? (
        <>
          <Card>
            <Text style={styles.amount}>{symbol}{Number(expense.amount).toLocaleString()}</Text>
            <Text style={styles.merchant}>{expense.merchant ?? expense.category?.name ?? 'Expense'}</Text>
            <Text style={styles.meta}>Date: {expense.date}</Text>
            <Text style={styles.meta}>Payment: {expense.paymentMethod?.replace('_', ' ') ?? '—'}</Text>
            {expense.notes && <Text style={styles.notes}>{expense.notes}</Text>}
          </Card>
          <Button title="Edit" onPress={startEditing} />
          <View style={styles.spacer} />
          <Button title="Duplicate" onPress={handleDuplicate} variant="outline" loading={loading} />
          <View style={styles.spacer} />
          <Button title="Delete" onPress={handleDelete} variant="danger" loading={loading} />
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
              <Input label="Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
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
                style={[styles.chip, selectedCategory === cat.id && { backgroundColor: cat.color ?? COLORS.primary, borderColor: cat.color ?? COLORS.primary }]}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  amount: { fontSize: 32, fontWeight: '800', color: COLORS.danger },
  merchant: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 8 },
  meta: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  notes: { fontSize: 14, color: COLORS.text, marginTop: 12 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  spacer: { height: 12 },
});
