import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Button,
  Input,
  StackScrollScreen,
  FormFieldLabel,
  OptionChipList,
  FormSection,
  FormActions,
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
    parsed,
    categoryId,
    setCategoryId,
    categories,
    smsForm,
    emailForm,
    parseSms,
    parseEmail,
    confirmParsed,
    rejectParsed,
  } = useTransactionParsing();

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="integrations"
          subtitle="Paste SMS or email receipts to auto-extract expenses"
        />
      }
    >
      {parsed ? (
        <FormSection title="Parsed transaction" subtitle="Review before saving">
          <Text style={styles.confirmDetail}>{format(parsed.parsedAmount)} · {parsed.parsedMerchant ?? 'Unknown'}</Text>
          <Text style={styles.confirmMeta}>Confidence: {Math.round(parsed.confidence * 100)}%</Text>
          <FormFieldLabel>Category</FormFieldLabel>
          <OptionChipList
            items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
            selectedId={categoryId}
            onSelect={setCategoryId}
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
            />
          )}
        />
        <FormActions primaryTitle="Parse SMS" onPrimary={smsForm.handleSubmit(parseSms)} primaryLoading={smsLoading} />
      </FormSection>

      <FormSection title="Parse email" subtitle="Paste a receipt or order email">
        <Controller
          control={emailForm.control}
          name="subject"
          rules={{ required: 'Subject is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} error={emailForm.formState.errors.subject?.message} leftIcon="mail" />
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
    confirmDetail: { fontSize: 18, fontWeight: '700', color: t.colors.text },
    confirmMeta: { fontSize: 13, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
  });
}
