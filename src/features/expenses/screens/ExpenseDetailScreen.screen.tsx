import { useState } from 'react';
import { RefreshControl, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  DateInput,
  DetailSkeleton,
  EmptyState,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  FormStackScreen,
  FormSection,
  FormActions,
  DetailActions,
  DetailHero,
  DetailMetaList,
  FormErrorBanner,
  FormSuccessBanner,
} from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { useExpenseDetail, type ExpenseForm } from '@/features/expenses/hooks/useExpenseDetail';
import { useExpenseTagSuggestions } from '@/features/expenses/hooks/useExpenseTagSuggestions';
import { TagInput } from '@/features/expenses/components/TagInput';
import { SplitExpenseSection } from '@/features/family/components/SplitExpenseSection';
import { fetchAttachments, fetchAttachmentSuggestion, deleteReceipt, type ReceiptExtraction } from '@/features/expenses/services/receipts';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { formatCurrency } from '@/shared/utils/currency';
import { ValidationMessages, amountRules, dateRules, maxLen, optionalTextRules, textRules } from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

export function ExpenseDetailScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    expense,
    isLoading,
    isError,
    refetch,
    isRefetching,
    editing,
    setEditing,
    justSaved,
    loading,
    updating,
    duplicating,
    deleting,
    startEditing,
    update,
    duplicate,
    confirmDelete,
    submitError,
  } = useExpenseDetail(id);

  const { data: categories } = useCategoryOptions();
  const { suggestions: tagSuggestions } = useExpenseTagSuggestions();

  const { data: attachments = [], refetch: refetchAttachments } = useQuery({
    queryKey: ['expense-attachments', id],
    queryFn: () => (id ? fetchAttachments(id) : Promise.resolve([])),
    enabled: !!id,
  });

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    try {
      await deleteReceipt(id, attachmentId);
      refetchAttachments();
    } catch (err) {
      console.error('Failed to delete attachment', err);
    }
  };

  const [checkingSuggestionId, setCheckingSuggestionId] = useState<string | null>(null);
  const [suggestionNotReadyId, setSuggestionNotReadyId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ attachmentId: string; data: ReceiptExtraction } | null>(null);

  const handleCheckSuggestion = async (attachmentId: string) => {
    if (!id) return;
    setSuggestionNotReadyId(null);
    setCheckingSuggestionId(attachmentId);
    try {
      const result = await fetchAttachmentSuggestion(id, attachmentId);
      if (result && (result.merchant || result.amount !== undefined || result.date)) {
        setSuggestion({ attachmentId, data: result });
      } else {
        setSuggestionNotReadyId(attachmentId);
      }
    } catch (err) {
      console.error('Failed to fetch receipt suggestion', err);
      setSuggestionNotReadyId(attachmentId);
    } finally {
      setCheckingSuggestionId(null);
    }
  };

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: { amount: '', merchant: '', notes: '', categoryId: '', paymentMethod: 'upi', date: '', tags: [] },
  });

  const selectedPayment = watch('paymentMethod');

  const handleApplySuggestion = () => {
    if (!suggestion) return;
    const { data } = suggestion;
    startEditing(reset);
    if (data.merchant) setValue('merchant', data.merchant);
    if (data.amount !== undefined) setValue('amount', String(data.amount));
    if (data.date) setValue('date', data.date);
    setSuggestion(null);
  };

  if (isLoading) {
    return (
      <FormStackScreen eyebrow="Expense" title="Expense" subtitle="Loading details">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !expense) {
    return (
      <FormStackScreen eyebrow="Expense" title="Expense" subtitle="Unavailable">
        <EmptyState
          icon="activity"
          title="Couldn’t load expense"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const title = expense.merchant ?? expense.category?.name ?? 'Expense';
  const amount = formatCurrency(Number(expense.amount), expense.currency);

  return (
    <FormStackScreen
      eyebrow="Expense"
      title={editing ? 'Edit Expense' : title}
      subtitle={editing ? 'Update transaction' : expense.category?.name}
      refreshControl={
        editing ? undefined : <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />
      }
    >
      {justSaved ? <FormSuccessBanner message="Expense updated" /> : null}
      {submitError ? <FormErrorBanner message={submitError} /> : null}
      {!editing && suggestion ? (
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: theme.colors.surfaceContainer,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            marginBottom: theme.spacing.md,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.text }}>
            Scanned receipt found: {[suggestion.data.merchant, suggestion.data.amount !== undefined ? formatCurrency(suggestion.data.amount, expense.currency) : undefined, suggestion.data.date].filter(Boolean).join(' · ')}
          </Text>
          <Text style={{ fontSize: 12, color: theme.colors.textTertiary }}>
            Apply these details to this expense? Review before saving.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={handleApplySuggestion} accessibilityRole="button" accessibilityLabel="Apply scanned details">
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.primary }}>Apply</Text>
            </Pressable>
            <Pressable onPress={() => setSuggestion(null)} accessibilityRole="button" accessibilityLabel="Dismiss scanned details">
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textTertiary }}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {!editing ? (
        <>
          <DetailHero
            amount={amount}
            amountColor={theme.colors.danger}
            title={title}
            subtitle={expense.category?.name && expense.merchant ? expense.category.name : undefined}
          />
          <DetailMetaList
            rows={[
              { label: 'Date', value: expense.date },
              { label: 'Payment', value: expense.paymentMethod?.replace(/_/g, ' ') ?? '' },
              { label: 'Notes', value: expense.notes ?? '' },
              { label: 'Tags', value: expense.tags?.length ? expense.tags.join(', ') : '' },
            ]}
          />
          {attachments.length > 0 && (
            <View style={{ marginTop: theme.spacing.lg }}>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 14,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Receipt Attachments
              </Text>
              {attachments.map((att) => (
                <View
                  key={att.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: theme.colors.surfaceContainer,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSubtle,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <AppIcon name="receipt" size={20} color={theme.colors.primary} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{ fontWeight: '500', fontSize: 13, color: theme.colors.text }}
                        numberOfLines={1}
                      >
                        {att.fileName}
                      </Text>
                      <Text
                        style={{
                          fontWeight: '400',
                          fontSize: 11,
                          color: theme.colors.textTertiary,
                        }}
                      >
                        {Math.round(att.fileSize / 1024)} KB
                      </Text>
                      {suggestionNotReadyId === att.id ? (
                        <Text style={{ fontSize: 11, color: theme.colors.textTertiary, marginTop: 2 }}>
                          No scanned details yet — try again shortly
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {checkingSuggestionId === att.id ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <Pressable
                        onPress={() => void handleCheckSuggestion(att.id)}
                        style={{ padding: 6 }}
                        accessibilityRole="button"
                        accessibilityLabel="Check for scanned receipt details"
                      >
                        <AppIcon name="sparkles" size={16} color={theme.colors.primary} />
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => void handleDeleteAttachment(att.id)}
                      style={{ padding: 6 }}
                      accessibilityRole="button"
                      accessibilityLabel="Delete attachment"
                    >
                      <AppIcon name="trash" size={16} color={theme.colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
          <DetailActions
            primaryTitle="Edit"
            onPrimary={() => startEditing(reset)}
            secondaryTitle="Duplicate"
            onSecondary={duplicate}
            secondaryLoading={duplicating}
            onDestructive={confirmDelete}
            destructiveLoading={deleting}
          />
          {expense.type === 'expense' ? (
            <SplitExpenseSection transactionId={expense.id} amount={Number(expense.amount)} currency={expense.currency} />
          ) : null}
        </>
      ) : (
        <>
          <FormSection title="Amount & details">
            <Controller
              control={control}
              name="amount"
              rules={amountRules()}
              render={({ field: { onChange, value } }) => (
                <Input label={amountLabel('Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} leftIcon="expense" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="merchant"
              rules={textRules('merchant')}
              render={({ field: { onChange, value } }) => (
                <Input label="Merchant" maxLength={maxLen('merchant')} value={value} onChangeText={onChange} error={errors.merchant?.message} leftIcon="activity" disabled={loading} />
              )}
            />
            <Controller
              control={control}
              name="date"
              rules={dateRules()}
              render={({ field: { onChange, value } }) => {
                const b = DateBounds.transaction(value);
                return (
                  <DateInput
                    label="Date"
                    value={value}
                    onChange={onChange}
                    error={errors.date?.message}
                    disabled={loading}
                    minimumDate={b.minimumDate}
                    maximumDate={b.maximumDate}
                  />
                );
              }}
            />
          </FormSection>

          <FormSection title="Payment & category">
            <FormFieldLabel>Payment method</FormFieldLabel>
            <OptionChips
              options={PAYMENT_METHODS.map((pm) => pm.value)}
              value={selectedPayment}
              onChange={(v) => setValue('paymentMethod', v)}
              getLabel={(v) => PAYMENT_METHODS.find((pm) => pm.value === v)?.label ?? v}
              disabled={loading}
            />
            <View style={{ marginTop: theme.spacing.lg }}>
              <FormFieldLabel>Category</FormFieldLabel>
              <Controller
                control={control}
                name="categoryId"
                rules={{ required: ValidationMessages.categoryRequired }}
                render={({ field: { onChange, value } }) => (
                  <OptionChipList
                    items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
                    selectedId={value}
                    onSelect={onChange}
                    error={errors.categoryId?.message}
                    disabled={loading}
                  />
                )}
              />
            </View>
            <Controller
              control={control}
              name="tags"
              render={({ field: { onChange, value } }) => (
                <TagInput value={value} onChange={onChange} suggestions={tagSuggestions} disabled={loading} />
              )}
            />
          </FormSection>

          <FormSection title="Notes">
            <Controller
              control={control}
              name="notes"
              rules={optionalTextRules('notes')}
              render={({ field: { onChange, value } }) => (
                <Input label="Notes" maxLength={maxLen('notes')} value={value} onChangeText={onChange} multiline placeholder="Optional notes" disabled={loading} error={errors.notes?.message} />
              )}
            />
          </FormSection>

          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSubmit(update)}
            primaryLoading={updating}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </>
      )}
    </FormStackScreen>
  );
}
