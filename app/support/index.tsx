import { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Button, Input, Card } from '@/src/components/ui';
import { apiPost, apiGet } from '@/src/services/api';
import { useTheme } from '@/src/theme';

interface TicketForm {
  subject: string;
  message: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function SupportScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    defaultValues: { subject: '', message: '' },
  });

  const loadTickets = async () => {
    try {
      const data = await apiGet<SupportTicket[]>('/support');
      setTickets(data);
    } catch {
      // ignore on first load
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const onSubmit = async (data: TicketForm) => {
    setLoading(true);
    try {
      await apiPost('/support', data);
      reset();
      await loadTickets();
      Alert.alert('Submitted', 'Our team will respond within 24–48 hours.');
    } catch {
      Alert.alert('Error', 'Could not submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Support</Text>
      <Text style={styles.subtitle}>Describe your issue and we will get back to you</Text>

      <Card style={styles.card}>
        <Controller
          control={control}
          name="subject"
          rules={{ required: 'Subject is required', minLength: { value: 3, message: 'At least 3 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Subject" value={value} onChangeText={onChange} error={errors.subject?.message} />
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
      </Card>

      {tickets.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Your Tickets</Text>
          {tickets.map((t) => (
            <Card key={t.id} style={styles.ticketCard}>
              <Text style={styles.ticketSubject}>{t.subject}</Text>
              <Text style={styles.ticketStatus}>{t.status.replace('_', ' ')}</Text>
              <Text style={styles.ticketDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
            </Card>
          ))}
        </>
      )}

      <Button title="Back" onPress={() => router.back()} variant="outline" />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: 16, paddingBottom: 48 },
    title: { fontSize: 24, fontWeight: '800', color: t.colors.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: t.colors.textSecondary, marginBottom: 24 },
    card: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: t.colors.text, marginBottom: 12 },
    ticketCard: { marginBottom: 8 },
    ticketSubject: { fontSize: 16, fontWeight: '600', color: t.colors.text },
    ticketStatus: { fontSize: 13, color: t.colors.primary, marginTop: 4, textTransform: 'capitalize' },
    ticketDate: { fontSize: 12, color: t.colors.textSecondary, marginTop: 4 },
  });
}
