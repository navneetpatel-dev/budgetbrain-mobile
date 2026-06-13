import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, StackScrollScreen, GroupedCard, FormSection, FormActions } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useSupportTickets } from '@/features/support/hooks/useSupportTickets';

export default function SupportScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, tickets, control, handleSubmit, errors, onSubmit } = useSupportTickets();

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
        <Controller
          control={control}
          name="subject"
          rules={{ required: 'Subject is required', minLength: { value: 3, message: 'At least 3 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} error={errors.subject?.message} leftIcon="support" placeholder="Brief summary of your issue" />
          )}
        />
        <Controller
          control={control}
          name="message"
          rules={{ required: 'Message is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Message"
              value={value}
              onChangeText={onChange}
              multiline
              error={errors.message?.message}
              placeholder="Describe what happened and how we can help..."
              helperText="Minimum 10 characters"
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
