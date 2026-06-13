import { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Button, Input, Card } from '@/src/components/ui';
import { apiPost, apiGet } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';
import type { Category } from '@/src/types';

interface SmsForm { content: string }
interface EmailForm { subject: string; body: string }

interface ParsedRecord {
  id: string;
  parsedAmount: number;
  parsedMerchant: string | null;
  confidence: number;
}

export default function IntegrationsScreen() {
  const router = useRouter();
  const [smsLoading, setSmsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedRecord | null>(null);
  const [categoryId, setCategoryId] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const smsForm = useForm<SmsForm>({ defaultValues: { content: '' } });
  const emailForm = useForm<EmailForm>({ defaultValues: { subject: '', body: '' } });

  const handleParseResult = (result: { parsed: ParsedRecord; suggestion: { amount: number; merchant: string; confidence: number } }) => {
    setParsed({
      id: result.parsed.id,
      parsedAmount: Number(result.suggestion.amount),
      parsedMerchant: result.suggestion.merchant,
      confidence: result.suggestion.confidence,
    });
    setCategoryId('');
  };

  const parseSms = async (data: SmsForm) => {
    setSmsLoading(true);
    setParsed(null);
    try {
      const result = await apiPost<{ parsed: ParsedRecord; suggestion: { amount: number; merchant: string; confidence: number } }>(
        '/integrations/sms',
        data
      );
      handleParseResult(result);
    } catch {
      Alert.alert('Error', 'Could not parse SMS');
    } finally {
      setSmsLoading(false);
    }
  };

  const parseEmail = async (data: EmailForm) => {
    setEmailLoading(true);
    setParsed(null);
    try {
      const result = await apiPost<{ parsed: ParsedRecord; suggestion: { amount: number; merchant: string; confidence: number } }>(
        '/integrations/email',
        data
      );
      handleParseResult(result);
    } catch {
      Alert.alert('Error', 'Could not parse email');
    } finally {
      setEmailLoading(false);
    }
  };

  const confirmParsed = async () => {
    if (!parsed || !categoryId) {
      Alert.alert('Select Category', 'Choose a category before confirming.');
      return;
    }
    setConfirmLoading(true);
    try {
      await apiPost(`/integrations/${parsed.id}/confirm`, { categoryId });
      Alert.alert('Expense Created', 'Transaction added from parsed content.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/expenses') },
      ]);
      setParsed(null);
    } catch {
      Alert.alert('Error', 'Could not create expense');
    } finally {
      setConfirmLoading(false);
    }
  };

  const rejectParsed = async () => {
    if (!parsed) return;
    try {
      await apiPost(`/integrations/${parsed.id}/reject`, {});
      setParsed(null);
    } catch {
      Alert.alert('Error', 'Could not reject parsed transaction');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Transaction Parsing</Text>
      <Text style={styles.subtitle}>Paste SMS or email receipts to auto-extract and confirm expenses</Text>

      {parsed && (
        <Card style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Parsed Transaction</Text>
          <Text style={styles.confirmDetail}>₹{parsed.parsedAmount} · {parsed.parsedMerchant ?? 'Unknown'}</Text>
          <Text style={styles.confirmDetail}>Confidence: {Math.round(parsed.confidence * 100)}%</Text>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories?.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[styles.chip, categoryId === cat.id && { backgroundColor: cat.color ?? COLORS.primary }]}
              >
                <Text style={[styles.chipText, categoryId === cat.id && styles.chipTextActive]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
          <Button title="Confirm as Expense" onPress={confirmParsed} loading={confirmLoading} />
          <View style={styles.spacer} />
          <Button title="Reject" onPress={rejectParsed} variant="outline" />
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Parse SMS</Text>
        <Controller
          control={smsForm.control}
          name="content"
          rules={{ required: 'SMS content is required', minLength: { value: 10, message: 'At least 10 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="SMS Content" value={value} onChangeText={onChange} multiline placeholder="Paste bank SMS here..." error={smsForm.formState.errors.content?.message} />
          )}
        />
        <Button title="Parse SMS" onPress={smsForm.handleSubmit(parseSms)} loading={smsLoading} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Parse Email Receipt</Text>
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
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
  card: { marginBottom: 16 },
  confirmCard: { marginBottom: 16, borderColor: COLORS.primary, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  confirmTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  confirmDetail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginTop: 12, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  chipText: { fontSize: 13, color: COLORS.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  spacer: { height: 8 },
});
