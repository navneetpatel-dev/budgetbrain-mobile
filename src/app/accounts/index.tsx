import { useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Card,
  EmptyState,
  ScreenLoader,
  FormModal,
  FeatureHeader,
  StickyHeaderFlatScreen,
  ActionFab,
  FormFieldLabel,
  OptionChips,
} from '@/shared/components/ui';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { useAccounts, ACCOUNT_TYPES } from '@/features/accounts/hooks/useAccounts';

export default function AccountsScreen() {
  const theme = useTheme();
  const { amountLabel, format } = useUserCurrency();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const items = data ?? [];

  return (
    <View style={styles.root}>
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
            <FormFieldLabel>Type</FormFieldLabel>
            <OptionChips
              options={ACCOUNT_TYPES.map((t) => t.value)}
              value={accountType}
              onChange={(v) => setValue('type', v)}
              getLabel={(v) => ACCOUNT_TYPES.find((t) => t.value === v)?.label ?? v}
            />
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

      <StickyHeaderFlatScreen
        inset="stack"
        header={
          <FeatureHeader
            eyebrow="NET WORTH"
            title="Accounts"
            subtitle={`${items.length} account${items.length !== 1 ? 's' : ''}`}
          />
        }
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: fabBottom + 72 }}
        ListEmptyComponent={
          <EmptyState icon="wallet" title="No accounts" subtitle="Add bank accounts and wallets to track net worth" action="Add account" onAction={openCreate} />
        }
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

      {!showForm && <ActionFab onPress={openCreate} label="Add account" />}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    item: { marginBottom: 0 },
    itemName: { fontSize: 16, fontWeight: '600', color: t.colors.text },
    itemMeta: { fontSize: 12, color: t.colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
    itemAmount: { fontSize: 18, fontWeight: '700', color: t.colors.text, marginTop: 6 },
    debt: { color: t.colors.danger },
    spacer: { height: 8 },
  });
}
