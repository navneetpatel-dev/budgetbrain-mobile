import { useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, EmptyState, ScreenLoader, ScreenContainer, FormModal } from '@/shared/components/ui';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { useAccounts, ACCOUNT_TYPES } from '@/features/accounts/hooks/useAccounts';

export default function AccountsScreen() {
  const theme = useTheme();
  const { amountLabel, format } = useUserCurrency();
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
    accountType,
    openCreate,
    openEdit,
    onSubmit,
  } = useAccounts();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <ScreenContainer>
      <FormModal visible={showForm} title={editingId ? 'Edit Account' : 'New Account'} onClose={() => setShowForm(false)}>
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
            <Input label={amountLabel('Balance')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.balance?.message} />
          )}
        />
        <Button title={editingId ? 'Update' : 'Add Account'} onPress={handleSubmit(onSubmit)} loading={loading} />
        <View style={styles.spacer} />
        <Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" />
      </FormModal>

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
                {format(Number(item.balance))}
              </Text>
            </Card>
          </Pressable>
        )}
      />

      {!showForm && (
        <Pressable style={styles.fab} onPress={openCreate} accessibilityRole="button" accessibilityLabel="Add account">
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
    debt: { color: t.colors.danger },
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
