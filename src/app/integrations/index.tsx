import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, StackScrollScreen, GroupedCard, FormFieldLabel, OptionChipList } from '@/shared/components/ui';
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
      {parsed && (
        <Card style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Parsed Transaction</Text>
          <Text style={styles.confirmDetail}>{format(parsed.parsedAmount)} · {parsed.parsedMerchant ?? 'Unknown'}</Text>
          <Text style={styles.confirmDetail}>Confidence: {Math.round(parsed.confidence * 100)}%</Text>
          <FormFieldLabel>Category</FormFieldLabel>
          <OptionChipList
            items={(categories ?? []).map((cat) => ({ id: cat.id, label: cat.name, color: cat.color ?? undefined }))}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
          <Button title="Confirm as Expense" onPress={confirmParsed} loading={confirmLoading} />
          <Button title="Reject" onPress={rejectParsed} variant="outline" />
        </Card>
      )}

      <GroupedCard title="Parse SMS" padded>
        <Controller
          control={smsForm.control}
          name="content"
          rules={{ required: 'SMS content is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="SMS Content" value={value} onChangeText={onChange} multiline placeholder="Paste bank SMS here..." error={smsForm.formState.errors.content?.message} />
          )}
        />
        <Button title="Parse SMS" onPress={smsForm.handleSubmit(parseSms)} loading={smsLoading} />
      </GroupedCard>

      <GroupedCard title="Parse email" padded>
        <Controller
          control={emailForm.control}
          name="subject"
          rules={{ required: 'Subject is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} error={emailForm.formState.errors.subject?.message} />
          )}
        />
        <Controller
          control={emailForm.control}
          name="body"
          rules={{ required: 'Body is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Email Body" value={value} onChangeText={onChange} multiline placeholder="Paste email body here..." error={emailForm.formState.errors.body?.message} />
          )}
        />
        <Button title="Parse Email" onPress={emailForm.handleSubmit(parseEmail)} loading={emailLoading} variant="outline" />
      </GroupedCard>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    confirmCard: { padding: t.spacing.lg, marginBottom: 0, borderColor: t.colors.primary, borderWidth: 1 },
    confirmTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text },
    confirmDetail: { fontSize: 14, color: t.colors.textSecondary },
  });
}
