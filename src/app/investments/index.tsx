import { useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Input,
  Card,
  EmptyState,
  ListSkeleton,
  FormModal,
  DateInput,
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
import { useInvestments, INVESTMENT_TYPES } from '@/features/investments/hooks/useInvestments';
import { amountRules, dateRules, maxLen, optionalTextRules, quantityRules, textRules } from '@/shared/validation/fieldLimits';

export default function InvestmentsScreen() {
  const theme = useTheme();
  const { format } = useUserCurrency();
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
    invType,
    openCreate,
    openEdit,
    onSubmit,
  } = useInvestments();

  if (isLoading) {
    return <ListSkeleton count={4} variant="account" />;
  }

  const items = data ?? [];

  return (
    <View style={styles.root}>
      <FormModal
        visible={showForm}
        title={editingId ? 'Edit Investment' : 'New Investment'}
        subtitle="Track stocks, mutual funds, and more"
        onClose={() => setShowForm(false)}
        footer={
          <FormActions
            primaryTitle={editingId ? 'Update' : 'Add Investment'}
            onPrimary={handleSubmit(onSubmit)}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={() => setShowForm(false)}
          />
        }
      >
        {submitError ? <FormErrorBanner message={submitError} /> : null}
        {!editingId && (
          <>
            <Controller
              control={control}
              name="name"
              rules={textRules('entityName')}
              render={({ field: { onChange, value } }) => (
                <Input label="Investment name" value={value} onChangeText={onChange} maxLength={255} error={errors.name?.message} leftIcon="chart" />
              )}
            />
            <FormFieldLabel>Investment type</FormFieldLabel>
            <OptionChips
              options={INVESTMENT_TYPES.map((t) => t.value)}
              value={invType}
              onChange={(v) => setValue('type', v)}
              getLabel={(v) => INVESTMENT_TYPES.find((t) => t.value === v)?.label ?? v}
            />
            <Controller
              control={control}
              name="symbol"
              rules={optionalTextRules('symbol')}
              render={({ field: { onChange, value } }) => (
                <Input label="Symbol" maxLength={maxLen('symbol')} value={value} onChangeText={onChange} placeholder="e.g. AAPL, INFY" helperText="Optional ticker symbol" error={errors.symbol?.message} />
              )}
            />
            <Controller
              control={control}
              name="purchasePrice"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label="Purchase price" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.purchasePrice?.message} />
              )}
            />
            <Controller
              control={control}
              name="purchaseDate"
              rules={dateRules()}
              render={({ field: { onChange, value } }) => (
                <DateInput label="Purchase date" value={value} onChange={onChange} error={errors.purchaseDate?.message} />
              )}
            />
          </>
        )}
        <Controller
          control={control}
          name="quantity"
          rules={quantityRules()}
          render={({ field: { onChange, value } }) => (
            <Input label="Quantity" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.quantity?.message} />
          )}
        />
        <Controller
          control={control}
          name="currentPrice"
          rules={amountRules()}
          render={({ field: { onChange, value } }) => (
            <Input label="Current price" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.currentPrice?.message} />
          )}
        />
      </FormModal>

      <StickyHeaderFlatScreen
        inset="stack"
        header={
          <ProfileStackHeader
            screen="investments"
            subtitle={`${items.length} holding${items.length !== 1 ? 's' : ''}`}
          />
        }
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: fabBottom + 72 }}
        ListEmptyComponent={
          <EmptyState icon="chart" title="No investments" subtitle="Track stocks, mutual funds, and more" action="Add investment" onAction={openCreate} />
        }
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

      {!showForm && <ActionFab onPress={openCreate} label="Add investment" />}
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
    gainLoss: { fontSize: 13, marginTop: 4, fontWeight: '600' },
    gain: { color: t.colors.success },
    loss: { color: t.colors.danger },
    spacer: { height: 8 },
  });
}
