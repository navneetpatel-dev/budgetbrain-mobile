import { useMemo } from 'react';
import { RefreshControl, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Input,
  Card,
  EmptyState,
  ListRowsSkeleton,
  FormModal,
  StickyHeaderFlatScreen,
  ActionFab,
  FormFieldLabel,
  OptionChips,
  FormActions,
  FormErrorBanner,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader.component';
import { useFabBottom } from '@/shared/hooks/useFabBottom.hook';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency.hook';
import { useAccounts, ACCOUNT_TYPES } from '@/features/accounts/hooks/useAccounts.hook';
import { last4Rules, maxLen, moneyValueRules, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';
import { createStyles } from './AccountsScreen.styles';

export function AccountsScreen() {
  const theme = useTheme();
  const { amountLabel, format } = useUserCurrency();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
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
          rules={textRules('entityName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Account name" maxLength={maxLen('entityName')} value={value} onChangeText={onChange} error={errors.name?.message} leftIcon="wallet" disabled={loading} />
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
              rules={optionalTextRules('institution')}
              render={({ field: { onChange, value } }) => (
                <Input label="Institution" maxLength={maxLen('institution')} value={value} onChangeText={onChange} placeholder="e.g. HDFC Bank" leftIcon="netWorth" disabled={loading} error={errors.institution?.message} />
              )}
            />
            <Controller
              control={control}
              name="accountNumberLast4"
              rules={last4Rules()}
              render={({ field: { onChange, value } }) => (
                <Input label="Last 4 digits" value={value} onChangeText={onChange} keyboardType="number-pad" maxLength={maxLen('accountNumberLast4')} helperText="Optional — for identification only" disabled={loading} error={errors.accountNumberLast4?.message} />
              )}
            />
          </>
        )}
        <Controller
          control={control}
          name="balance"
          rules={moneyValueRules({ allowNegative: true })}
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
            subtitle={isLoading ? 'Loading…' : `${items.length} account${items.length !== 1 ? 's' : ''}`}
          />
        }
        data={isLoading ? [] : items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: fabBottom + 72 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={4} variant="account" />
          ) : (
            <EmptyState icon="wallet" title="No accounts" subtitle="Add bank accounts and wallets to track net worth" action="Add account" onAction={openCreate} />
          )
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

