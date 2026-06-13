import { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '@/src/components/ui';
import { apiGet, apiPost } from '@/src/services/api';
import { uploadReceipt } from '@/src/services/receipts';
import { queueOfflineAction, isOnline } from '@/src/services/offlineSync';
import { trackEvent } from '@/src/services/analytics';
import { COLORS } from '@/src/constants/config';
import type { Category, Transaction } from '@/src/types';
import { Text } from 'react-native';

interface ExpenseForm {
  amount: string;
  merchant: string;
  notes: string;
  categoryId: string;
  paymentMethod: string;
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{ uri: string; name: string; type: string } | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: { amount: '', merchant: '', notes: '', categoryId: '', paymentMethod: 'upi' },
  });

  const selectedCategory = watch('categoryId');

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setReceipt({
        uri: asset.uri,
        name: asset.fileName ?? 'receipt.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const onSubmit = async (data: ExpenseForm) => {
    if (!data.categoryId) {
      Alert.alert('Category Required', 'Please select a category');
      return;
    }

    const payload = {
      type: 'expense' as const,
      amount: Number(data.amount),
      merchant: data.merchant || undefined,
      notes: data.notes || undefined,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      date: new Date().toISOString().split('T')[0],
    };

    setLoading(true);
    try {
      const online = await isOnline();

      if (!online) {
        queueOfflineAction('create', payload);
        Alert.alert('Saved Offline', 'Expense will sync when you reconnect.');
        router.back();
        return;
      }

      const transaction = await apiPost<Transaction>('/expenses', payload);

      if (receipt && transaction?.id) {
        await uploadReceipt(transaction.id, receipt.uri, receipt.name, receipt.type);
      }

      trackEvent('expense_created', { amount: payload.amount, hasReceipt: !!receipt });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      router.back();
    } catch {
      queueOfflineAction('create', payload);
      Alert.alert('Saved Offline', 'Could not reach server. Expense queued for sync.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Amount (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="merchant"
        render={({ field: { onChange, value } }) => (
          <Input label="Merchant" value={value} onChangeText={onChange} placeholder="e.g. Swiggy, Amazon" />
        )}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {categories?.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setValue('categoryId', cat.id)}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && { backgroundColor: cat.color ?? COLORS.primary, borderColor: cat.color ?? COLORS.primary },
            ]}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Receipt (optional)</Text>
      <Pressable onPress={pickReceipt} style={styles.receiptPicker}>
        {receipt ? (
          <Image source={{ uri: receipt.uri }} style={styles.receiptPreview} />
        ) : (
          <Text style={styles.receiptPlaceholder}>Tap to attach JPG/PNG receipt</Text>
        )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  categoryText: { fontSize: 13, color: COLORS.text },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  receiptPicker: { height: 120, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', marginBottom: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.card },
  receiptPreview: { width: '100%', height: '100%' },
  receiptPlaceholder: { color: COLORS.textSecondary, fontSize: 14 },
});
