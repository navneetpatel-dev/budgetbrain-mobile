import { useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Input,
  Card,
  EmptyState,
  ListSkeleton,
  FormModal,
  StickyHeaderFlatScreen,
  ActionFab,
  FormFieldLabel,
  OptionChips,
  FormActions,
  FormErrorBanner,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
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
    submitError,
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
    return <ListSkeleton count={4} variant="account" />;
  }

  const items = data ?? [];

  return (
    <View style={styles.root}>
      <FormModal
        visible={showForm}
        title={editingId ? 'Edit Account' : 'New Account'}
        subtitle="Track bank accounts and wallets"
        onClose={() => setShowForm(false)}
        footer={
          <FormActions
            primaryTitle={editingId ? 'Update' : 'Add Account'}
            onPrimary={handleSubmit(onSubmit)}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={() => setShowForm(false)}
          />
        }
      >
        {submitError ? <FormErrorBanner message={submitError} /> : null}
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Account name" value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="wallet" disabled={loading} />
          )}
        />
        {!editingId && (
          <>
            <FormFieldLabel>Account type</FormFieldLabel>
            <OptionChips
              options={ACCOUNT_TYPES.map((t) => t.value)}
              value={accountType}
              onChange={(v) => setValue('type', v)}
              getLabel={(v) => ACCOUNT_TYPES.find((t) => t.value === v)?.label ?? v}
              disabled={loading}
            />
            <Controller
              control={control}
              name="institution"
              render={({ field: { onChange, value } }) => (
                <Input label="Institution" value={value} onChangeText={onChange} placeholder="e.g. HDFC Bank" leftIcon="netWorth" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="accountNumberLast4"
              render={({ field: { onChange, value } }) => (
                <Input label="Last 4 digits" value={value} onChangeText={onChange} keyboardType="number-pad" maxLength={4} helperText="Optional — for identification only" disabled={loading} />
              )}
            />
          </>
        )}
        <Controller
          control={control}
          name="balance"
          rules={{ required: 'Balance is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label={amountLabel('Balance')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.balance?.message} leftIcon="wallet" disabled={loading} />
          )}
        />
      </FormModal>

      <StickyHeaderFlatScreen
        inset="stack"
        header={
          <ProfileStackHeader
            screen="accounts"
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
