import { useState } from 'react';
import { StyleSheet, View, FlatList, Alert, Pressable, Text, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Card, EmptyState } from '@/src/components/ui';
import { apiGet, apiPost, apiPatch } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';
import type { FinancialAccount } from '@/src/types';

interface AccountForm {
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'wallet';
  institution: string;
  balance: string;
  accountNumberLast4: string;
}

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'wallet', label: 'Wallet' },
] as const;

export default function AccountsScreen() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiGet<FinancialAccount[]>('/accounts'),
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AccountForm>({
    defaultValues: { name: '', type: 'bank', institution: '', balance: '', accountNumberLast4: '' },
  });

  const accountType = watch('type');

  const openCreate = () => {
    reset({ name: '', type: 'bank', institution: '', balance: '', accountNumberLast4: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (acc: FinancialAccount) => {
    reset({
      name: acc.name,
      type: acc.type,
      institution: acc.institution ?? '',
      balance: String(acc.balance),
      accountNumberLast4: acc.accountNumberLast4 ?? '',
    });
    setEditingId(acc.id);
    setShowForm(true);
  };

  const onSubmit = async (form: AccountForm) => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        institution: form.institution || undefined,
        balance: Number(form.balance),
        accountNumberLast4: form.accountNumberLast4 || undefined,
      };
      if (editingId) {
        await apiPatch(`/accounts/${editingId}`, { name: payload.name, balance: payload.balance });
      } else {
        await apiPost('/accounts', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Could not save account');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showForm && (
        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Account Name" value={value} onChangeText={onChange} error={errors.name?.message} />
            )}
          />
          {!editingId && (
            <>
              <Text style={styles.label}>Type</Text>
              <View style={styles.chipRow}>
                {ACCOUNT_TYPES.map((t) => (
                  <Pressable key={t.value} onPress={() => setValue('type', t.value)} style={[styles.chip, accountType === t.value && styles.chipActive]}>
                    <Text style={[styles.chipText, accountType === t.value && styles.chipTextActive]}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Controller
                control={control}
                name="institution"
                render={({ field: { onChange, value } }) => (
                  <Input label="Institution" value={value} onChangeText={onChange} placeholder="e.g. HDFC Bank" />
                )}
              />
              <Controller
                control={control}
                name="accountNumberLast4"
                render={({ field: { onChange, value } }) => (
                  <Input label="Last 4 digits" value={value} onChangeText={onChange} keyboardType="number-pad" maxLength={4} />
                )}
              />
            </>
          )}
          <Controller
            control={control}
            name="balance"
            rules={{ required: 'Balance is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Balance (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.balance?.message} />
            )}
          />
          <Button title={editingId ? 'Update' : 'Add Account'} onPress={handleSubmit(onSubmit)} loading={loading} />
          <View style={styles.spacer} />
          <Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" />
        </Card>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No accounts" subtitle="Add bank accounts and wallets to track net worth" />}
        renderItem={({ item }) => (
          <Pressable onPress={() => openEdit(item)}>
            <Card style={styles.item}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.type.replace('_', ' ')} · {item.institution ?? '—'}</Text>
              <Text style={[styles.itemAmount, item.type === 'credit_card' && styles.debt]}>
                ₹{Number(item.balance).toLocaleString()}
              </Text>
            </Card>
          </Pressable>
        )}
      />

      {!showForm && (
        <Pressable style={styles.fab} onPress={openCreate}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80 },
  formCard: { margin: 16, marginBottom: 0 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  item: { marginBottom: 10 },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  itemAmount: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 6 },
  debt: { color: COLORS.danger },
  spacer: { height: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
