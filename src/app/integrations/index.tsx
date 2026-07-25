import { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Input,
  StackScrollScreen,
  FormFieldLabel,
  OptionChipList,
  FormSection,
  FormActions,
  FormErrorBanner,
  ListSkeleton,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useUserCurrency } from '@/shared/hooks/useUserCurrency';
import { useTransactionParsing } from '@/features/integrations/hooks/useTransactionParsing';

export default function IntegrationsScreen() {
  const theme = useTheme();
  const { format } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    smsLoading,
    emailLoading,
    confirmLoading,
    pendingLoading,
    parsed,
    pendingItems,
    pendingTotal,
    selectedId,
    selectPending,
    categoryId,
    setCategoryId,
    categories,
    smsForm,
    emailForm,
    parseSms,
    parseEmail,
    confirmParsed,
    rejectParsed,
    smsError,
    emailError,
    confirmError,
    actionError,
  } = useTransactionParsing();

  if (pendingLoading) return <ListSkeleton count={4} variant="transaction" />;

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="integrations"
          subtitle="Paste SMS or email receipts to auto-extract expenses"
        />
      }
    >
      {pendingTotal > 0 ? (
        <FormSection title="Pending review" subtitle={`${pendingTotal} item${pendingTotal !== 1 ? 's' : ''} awaiting confirmation`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pendingRow}>
            {pendingItems.map((item) => {
              const selected = item.id === selectedId;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => selectPending(item.id)}
                  disabled={confirmLoading}
                  style={[styles.pendingChip, selected && styles.pendingChipSelected, confirmLoading && { opacity: 0.55 }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.pendingChipText, selected && styles.pendingChipTextSelected]}>
                    {format(item.parsedAmount)} · {item.parsedMerchant ?? item.source.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </FormSection>
      ) : null}

      {parsed ? (
        <FormSection title="Parsed transaction" subtitle="Review before saving">
          {confirmError ? <FormErrorBanner message={confirmError} /> : null}
          {actionError ? <FormErrorBanner message={actionError} /> : null}
          <Text style={styles.confirmDetail}>
            {format(parsed.parsedAmount)} · {parsed.parsedMerchant ?? 'Unknown'}
          </Text>
          <Text style={styles.confirmMeta}>
            {parsed.source.toUpperCase()} · Confidence: {Math.round(parsed.confidence * 100)}%
          </Text>
          <FormFieldLabel>Category</FormFieldLabel>
          <OptionChipList
            items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
            selectedId={categoryId}
            onSelect={setCategoryId}
            disabled={confirmLoading}
          />
          <FormActions
            primaryTitle="Confirm as Expense"
            onPrimary={confirmParsed}
            primaryLoading={confirmLoading}
            secondaryTitle="Reject"
            onSecondary={rejectParsed}
          />
        </FormSection>
      ) : null}

      <FormSection title="Parse SMS" subtitle="Paste a bank transaction SMS">
        {smsError ? <FormErrorBanner message={smsError} /> : null}
        <Controller
          control={smsForm.control}
          name="content"
          rules={{ required: 'SMS content is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="SMS content"
              value={value}
              onChangeText={onChange}
              multiline
              placeholder="Paste bank SMS here..."
              error={smsForm.formState.errors.content?.message}
              helperText="Include amount and merchant if possible"
              disabled={smsLoading}
            />
          )}
        />
        <FormActions primaryTitle="Parse SMS" onPrimary={smsForm.handleSubmit(parseSms)} primaryLoading={smsLoading} />
      </FormSection>

      <FormSection title="Parse email" subtitle="Paste a receipt or order email">
        {emailError ? <FormErrorBanner message={emailError} /> : null}
        <Controller
          control={emailForm.control}
          name="subject"
          rules={{ required: 'Subject is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} error={emailForm.formState.errors.subject?.message} leftIcon="mail" disabled={emailLoading} />
          )}
        />
        <Controller
          control={emailForm.control}
          name="body"
          rules={{ required: 'Body is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email body"
              value={value}
              onChangeText={onChange}
              multiline
              placeholder="Paste email body here..."
              error={emailForm.formState.errors.body?.message}
              disabled={emailLoading}
            />
          )}
        />
        <FormActions primaryTitle="Parse Email" onPrimary={emailForm.handleSubmit(parseEmail)} primaryLoading={emailLoading} />
      </FormSection>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    pendingRow: { gap: 8, paddingBottom: 4 },
    pendingChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: t.radii.full,
      borderWidth: 1.5,
      borderColor: t.colors.borderSubtle,
      backgroundColor: t.colors.surface,
    },
    pendingChipSelected: {
      borderColor: t.colors.primary,
      backgroundColor: t.colors.primarySoft,
    },
    pendingChipText: { fontSize: 13, fontWeight: '600', color: t.colors.textSecondary },
    pendingChipTextSelected: { color: t.colors.primary },
    confirmDetail: { fontSize: 18, fontWeight: '700', color: t.colors.text },
    confirmMeta: { fontSize: 13, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
  });
}
