import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, Pressable } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, useScrollContentStyle } from '@/src/shared/components/ui';
import { useTheme } from '@/src/shared/theme';
import { useUserCurrency } from '@/src/shared/hooks/useUserCurrency';
import { useTransactionParsing } from '@/src/features/integrations/hooks/useTransactionParsing';

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

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Text style={styles.title}>Transaction Parsing</Text>
      <Text style={styles.subtitle}>Paste SMS or email receipts to auto-extract and confirm expenses</Text>

      {parsed && (
        <Card style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Parsed Transaction</Text>
          <Text style={styles.confirmDetail}>{format(parsed.parsedAmount)} · {parsed.parsedMerchant ?? 'Unknown'}</Text>
          <Text style={styles.confirmDetail}>Confidence: {Math.round(parsed.confidence * 100)}%</Text>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories?.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategoryId(cat.id)}
                style={[styles.chip, categoryId === cat.id && { backgroundColor: cat.color ?? theme.colors.primary }]}
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    title: { fontSize: 24, fontWeight: '800', color: t.colors.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: t.colors.textSecondary, marginBottom: 24 },
    card: { marginBottom: 16 },
    confirmCard: { marginBottom: 16, borderColor: t.colors.primary, borderWidth: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginBottom: 12 },
    confirmTitle: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginBottom: 8 },
    confirmDetail: { fontSize: 14, color: t.colors.textSecondary, marginBottom: 4 },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginTop: 12, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: t.colors.border },
    chipText: { fontSize: 13, color: t.colors.text },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
    spacer: { height: 8 },
  });
}
