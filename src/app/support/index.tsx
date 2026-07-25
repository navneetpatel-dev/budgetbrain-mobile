import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, StackScrollScreen, GroupedCard, FormSection, FormActions, FormErrorBanner, FormSuccessBanner, SupportSkeleton } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useSupportTickets } from '@/features/support/hooks/useSupportTickets';
import { maxLen, textRules } from '@/shared/validation/fieldLimits';

export default function SupportScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, isLoading, tickets, control, handleSubmit, errors, onSubmit, submitError, submitSuccess } = useSupportTickets();

  if (isLoading) return <SupportSkeleton />;

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="support"
          subtitle="Describe your issue and we will get back to you"
        />
      }
    >
      <FormSection title="New ticket" subtitle="We typically respond within 24 hours">
        {submitError ? <FormErrorBanner message={submitError} /> : null}
        {submitSuccess ? <FormSuccessBanner message={submitSuccess} /> : null}
        <Controller
          control={control}
          name="subject"
          rules={textRules('subject')}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} maxLength={maxLen('subject')} error={errors.subject?.message} leftIcon="support" placeholder="Brief summary of your issue" disabled={loading} />
          )}
        />
        <Controller
          control={control}
          name="message"
          rules={textRules('message')}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Message"
              value={value}
              onChangeText={onChange}
              maxLength={maxLen('message')}
              multiline
              error={errors.message?.message}
              placeholder="Describe what happened and how we can help..."
              helperText="Must be at least 10 characters"
              disabled={loading}
            />
          )}
        />
        <FormActions primaryTitle="Submit Ticket" onPrimary={handleSubmit(onSubmit)} primaryLoading={loading} />
      </FormSection>

      {tickets.length > 0 && (
        <GroupedCard title="Your tickets" padded>
          {tickets.map((t) => (
            <Card key={t.id} style={styles.ticketCard}>
              <Text style={styles.ticketSubject}>{t.subject}</Text>
              <Text style={styles.ticketStatus}>{t.status.replace('_', ' ')}</Text>
              <Text style={styles.ticketDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
            </Card>
          ))}
        </GroupedCard>
      )}
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    ticketCard: { marginBottom: 0 },
    ticketSubject: { fontSize: 16, fontWeight: '600', color: t.colors.text },
    ticketStatus: { fontSize: 13, color: t.colors.primary, marginTop: 4, textTransform: 'capitalize' },
    ticketDate: { fontSize: 12, color: t.colors.textSecondary, marginTop: 4 },
  });
}
