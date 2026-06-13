import { useMemo } from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, useScrollContentStyle, ScreenIntro, GroupedCard } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useSupportTickets } from '@/features/support/hooks/useSupportTickets';

export default function SupportScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { loading, tickets, control, handleSubmit, errors, onSubmit } = useSupportTickets();
  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
      <ScreenIntro eyebrow="HELP" subtitle="Describe your issue and we will get back to you" />

      <GroupedCard title="NEW TICKET">
        <Controller
          control={control}
          name="subject"
          rules={{ required: 'Subject is required', minLength: { value: 3, message: 'At least 3 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} error={errors.subject?.message} leftIcon="support" />
          )}
        />
        <Controller
          control={control}
          name="message"
          rules={{ required: 'Message is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Message" value={value} onChangeText={onChange} multiline error={errors.message?.message} />
          )}
        />
        <Button title="Submit Ticket" onPress={handleSubmit(onSubmit)} loading={loading} />
      </GroupedCard>

      {tickets.length > 0 && (
        <GroupedCard title="YOUR TICKETS">
          {tickets.map((t) => (
            <Card key={t.id} style={styles.ticketCard}>
              <Text style={styles.ticketSubject}>{t.subject}</Text>
              <Text style={styles.ticketStatus}>{t.status.replace('_', ' ')}</Text>
              <Text style={styles.ticketDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
            </Card>
          ))}
        </GroupedCard>
      )}

      <Button title="Back" onPress={() => router.back()} variant="outline" />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    ticketCard: { marginBottom: 8 },
    ticketSubject: { fontSize: 16, fontWeight: '600', color: t.colors.text },
    ticketStatus: { fontSize: 13, color: t.colors.primary, marginTop: 4, textTransform: 'capitalize' },
    ticketDate: { fontSize: 12, color: t.colors.textSecondary, marginTop: 4 },
  });
}
