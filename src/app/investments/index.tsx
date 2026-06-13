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
  DateInput,
  StickyHeaderFlatScreen,
  ActionFab,
  FormFieldLabel,
  OptionChips,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { useInvestments, INVESTMENT_TYPES } from '@/features/investments/hooks/useInvestments';

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

  const items = data ?? [];

  return (
    <View style={styles.root}>
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
            <FormFieldLabel>Type</FormFieldLabel>
            <OptionChips
              options={INVESTMENT_TYPES.map((t) => t.value)}
              value={invType}
              onChange={(v) => setValue('type', v)}
              getLabel={(v) => INVESTMENT_TYPES.find((t) => t.value === v)?.label ?? v}
            />
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
