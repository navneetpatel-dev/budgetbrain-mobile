import { useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, EmptyState, ScreenLoader, ScreenContainer, FormModal, DateInput } from '@/shared/components/ui';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { useInvestments, INVESTMENT_TYPES } from '@/features/investments/hooks/useInvestments';

export default function InvestmentsScreen() {
  const theme = useTheme();
  const { format } = useUserCurrency();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme, fabBottom), [theme, fabBottom]);
  const {
    data,
    isLoading,
    showForm,
    setShowForm,
    editingId,
    loading,
    control,
    handleSubmit,
    setValue,
    errors,
    invType,
    openCreate,
    openEdit,
    onSubmit,
  } = useInvestments();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <ScreenContainer>
      <FormModal visible={showForm} title={editingId ? 'Edit Investment' : 'New Investment'} onClose={() => setShowForm(false)}>
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
                <DateInput label="Purchase Date" value={value} onChange={onChange} />
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
      </FormModal>

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
              <Text style={styles.itemAmount}>{format(item.currentValue ?? Number(item.quantity) * Number(item.currentPrice))}</Text>
              {item.gainLoss !== undefined && (
                <Text style={[styles.gainLoss, item.gainLoss >= 0 ? styles.gain : styles.loss]}>
                  {item.gainLoss >= 0 ? '+' : ''}{format(item.gainLoss)}
                </Text>
              )}
            </Card>
          </Pressable>
        )}
      />

      {!showForm && (
        <Pressable style={styles.fab} onPress={openCreate} accessibilityRole="button" accessibilityLabel="Add investment">
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, fabBottom: number) {
  return StyleSheet.create({
    list: { paddingTop: t.spacing.lg, paddingBottom: fabBottom + 64 },
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
      bottom: fabBottom,
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
