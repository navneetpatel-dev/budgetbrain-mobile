import { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Alert, Pressable, Text } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Card, EmptyState, ScreenLoader } from '@/src/components/ui';
import { apiGet, apiPost, apiPatch } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { Investment } from '@/src/types';

interface InvestmentForm {
  name: string;
  type: 'stocks' | 'mutual_fund' | 'fd' | 'crypto' | 'gold' | 'other';
  symbol: string;
  quantity: string;
  purchasePrice: string;
  currentPrice: string;
  purchaseDate: string;
}

const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'fd', label: 'Fixed Deposit' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'gold', label: 'Gold' },
  { value: 'other', label: 'Other' },
] as const;

export default function InvestmentsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: () => apiGet<Investment[]>('/investments'),
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InvestmentForm>({
    defaultValues: {
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  });

  const invType = watch('type');

  const openCreate = () => {
    reset({
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (inv: Investment) => {
    reset({
      name: inv.name,
      type: inv.type,
      symbol: inv.symbol ?? '',
      quantity: String(inv.quantity),
      purchasePrice: String(inv.purchasePrice),
      currentPrice: String(inv.currentPrice),
      purchaseDate: inv.purchaseDate,
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const onSubmit = async (form: InvestmentForm) => {
    setLoading(true);
    try {
      if (editingId) {
        await apiPatch(`/investments/${editingId}`, {
          currentPrice: Number(form.currentPrice),
          quantity: Number(form.quantity),
        });
      } else {
        await apiPost('/investments', {
          name: form.name,
          type: form.type,
          symbol: form.symbol || undefined,
          quantity: Number(form.quantity),
          purchasePrice: Number(form.purchasePrice),
          currentPrice: Number(form.currentPrice) || Number(form.purchasePrice),
          purchaseDate: form.purchaseDate,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Could not save investment');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={styles.container}>
      {showForm && (
        <Card style={styles.formCard}>
          {!editingId && (
            <>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Investment Name" value={value} onChangeText={onChange} error={errors.name?.message} />
                )}
              />
              <Text style={styles.label}>Type</Text>
              <View style={styles.chipRow}>
                {INVESTMENT_TYPES.map((t) => (
                  <Pressable key={t.value} onPress={() => setValue('type', t.value)} style={[styles.chip, invType === t.value && styles.chipActive]}>
                    <Text style={[styles.chipText, invType === t.value && styles.chipTextActive]}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Controller
                control={control}
                name="symbol"
                render={({ field: { onChange, value } }) => (
                  <Input label="Symbol (optional)" value={value} onChangeText={onChange} />
                )}
              />
              <Controller
                control={control}
                name="purchasePrice"
                rules={{ required: 'Purchase price is required' }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Purchase Price" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.purchasePrice?.message} />
                )}
              />
              <Controller
                control={control}
                name="purchaseDate"
                render={({ field: { onChange, value } }) => (
                  <Input label="Purchase Date" value={value} onChangeText={onChange} />
                )}
              />
            </>
          )}
          <Controller
            control={control}
            name="quantity"
            rules={{ required: 'Quantity is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Quantity" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.quantity?.message} />
            )}
          />
          <Controller
            control={control}
            name="currentPrice"
            rules={{ required: 'Current price is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Current Price" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.currentPrice?.message} />
            )}
          />
          <Button title={editingId ? 'Update' : 'Add Investment'} onPress={handleSubmit(onSubmit)} loading={loading} />
          <View style={styles.spacer} />
          <Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" />
        </Card>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No investments" subtitle="Track stocks, mutual funds, and more" />}
        renderItem={({ item }) => (
          <Pressable onPress={() => openEdit(item)}>
            <Card style={styles.item}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>{item.type.replace('_', ' ')}</Text>
              <Text style={styles.itemAmount}>₹{(item.currentValue ?? Number(item.quantity) * Number(item.currentPrice)).toLocaleString()}</Text>
              {item.gainLoss !== undefined && (
                <Text style={[styles.gainLoss, item.gainLoss >= 0 ? styles.gain : styles.loss]}>
                  {item.gainLoss >= 0 ? '+' : ''}₹{item.gainLoss.toLocaleString()}
                </Text>
              )}
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    list: { padding: 16, paddingBottom: 80 },
    formCard: { margin: 16, marginBottom: 0 },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipText: { fontSize: 13, color: t.colors.text },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
    item: { marginBottom: 10 },
    itemName: { fontSize: 16, fontWeight: '600', color: t.colors.text },
    itemMeta: { fontSize: 12, color: t.colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { fontSize: 18, fontWeight: '700', color: t.colors.text, marginTop: 6 },
    gainLoss: { fontSize: 13, marginTop: 4, fontWeight: '600' },
    gain: { color: t.colors.success },
    loss: { color: t.colors.danger },
    spacer: { height: 8 },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.lg,
    },
    fabText: { color: t.colors.onPrimary, fontSize: 28, fontWeight: '300', marginTop: -2 },
  });
}
