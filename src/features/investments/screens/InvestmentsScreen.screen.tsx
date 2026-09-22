import { useCallback, useMemo } from 'react';
import { RefreshControl, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Input,
  Card,
  EmptyState,
  ListRowsSkeleton,
  FormModal,
  DateInput,
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
import { useInvestments, INVESTMENT_TYPES } from '@/features/investments/hooks/useInvestments.hook';
import { amountRules, dateRules, maxLen, optionalTextRules, quantityRules, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';
import { createStyles } from './InvestmentsScreen.styles';
import type { Investment } from '@/shared/types';

function keyExtractor(item: Investment) {
  return item.id;
}

export function InvestmentsScreen() {
  const theme = useTheme();
  const { format } = useUserCurrency();
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
    invType,
    openCreate,
    openEdit,
    onSubmit,
  } = useInvestments();

  const items = data ?? [];

  const renderItem = useCallback(
    ({ item }: { item: Investment }) => (
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
    ),
    [styles, openEdit, format]
  );

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
                <Input label="Investment name" value={value} onChangeText={onChange} maxLength={maxLen('entityName')} error={errors.name?.message} leftIcon="chart" />
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
              rules={dateRules('investmentPurchase')}
              render={({ field: { onChange, value } }) => {
                const b = DateBounds.investmentPurchase(value);
                return (
                  <DateInput
                    label="Purchase date"
                    value={value}
                    onChange={onChange}
                    error={errors.purchaseDate?.message}
                    minimumDate={b.minimumDate}
                    maximumDate={b.maximumDate}
                  />
                );
              }}
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
            subtitle={isLoading ? 'Loading…' : `${items.length} holding${items.length !== 1 ? 's' : ''}`}
          />
        }
        data={isLoading ? [] : items}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: fabBottom + 72 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={4} variant="account" />
          ) : (
            <EmptyState icon="chart" title="No investments" subtitle="Track stocks, mutual funds, and more" action="Add investment" onAction={openCreate} />
          )
        }
        renderItem={renderItem}
      />

      {!showForm && <ActionFab onPress={openCreate} label="Add investment" />}
    </View>
  );
}

