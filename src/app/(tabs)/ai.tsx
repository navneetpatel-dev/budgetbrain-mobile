import { useMemo, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, EmptyState, Screen } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useAiChat } from '@/features/ai/hooks/useAiChat';

export default function AiScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const {
    currency,
    isPremium,
    message,
    setMessage,
    chatLoading,
    messages,
    insights,
    insightsLoading,
    anomalies,
    anomaliesLoading,
    sendMessage,
  } = useAiChat();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, chatLoading]);

  if (!isPremium) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>AI Coach is Premium</Text>
        <Text style={styles.gateSubtitle}>Get spending insights, anomaly detection, and a personal finance coach</Text>
        <Button title="Upgrade to Premium" onPress={() => router.push('/subscription')} />
      </View>
    );
  }

  return (
    <Screen ref={scrollRef} padded keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Spending Insights</Text>
      {insightsLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        insights?.insights.map((insight, i) => (
          <Card key={i} style={styles.insightCard}>
            <Text style={styles.insightText}>{insight}</Text>
          </Card>
        ))
      )}

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Anomalies</Text>
      {anomaliesLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : anomalies?.anomalies?.length ? (
        anomalies.anomalies.map((a, i) => (
          <Card key={i} style={styles.insightCard}>
            <Text style={styles.anomalyReason}>{a.reason}</Text>
            <Text style={styles.anomalyMeta}>
              {a.merchant ?? 'Unknown'} · {formatCurrency(Number(a.amount), currency)} · {a.date}
            </Text>
          </Card>
        ))
      ) : (
        <EmptyState title="No anomalies detected" subtitle="Your spending looks normal" icon="ai" />
      )}

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Chat with Coach</Text>
      {messages.map((m, i) => (
        <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
          <Text style={m.role === 'user' ? styles.userText : styles.assistantText}>{m.content}</Text>
        </View>
      ))}
      <View style={styles.chatRow}>
        <View style={styles.chatInputWrap}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask about your spending..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            style={styles.chatInput}
            accessibilityLabel="Chat message"
          />
        </View>
        <Pressable
          onPress={sendMessage}
          disabled={chatLoading || !message.trim()}
          style={[styles.sendBtn, (chatLoading || !message.trim()) && styles.sendBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {chatLoading ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <AppIcon name="chevronRight" size={20} color={theme.colors.onPrimary} />
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    gate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: t.colors.background },
    gateTitle: { ...t.typography.title, color: t.colors.text, marginBottom: 8 },
    gateSubtitle: { ...t.typography.bodyMedium, color: t.colors.textSecondary, textAlign: 'center', marginBottom: 24 },
    sectionTitle: { ...t.typography.title, fontSize: 18, color: t.colors.text, marginBottom: t.spacing.sm },
    sectionGap: { marginTop: t.spacing.lg },
    insightCard: { marginBottom: 8 },
    insightText: { ...t.typography.bodyMedium, color: t.colors.text, lineHeight: 20 },
    anomalyReason: { ...t.typography.bodyMedium, fontWeight: '600', color: t.colors.warning },
    anomalyMeta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
    bubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
    userBubble: { backgroundColor: t.colors.primary, alignSelf: 'flex-end' },
    assistantBubble: { backgroundColor: t.colors.surface, alignSelf: 'flex-start', borderWidth: 1, borderColor: t.colors.border },
    userText: { color: t.colors.onPrimary, fontSize: 14 },
    assistantText: { color: t.colors.text, fontSize: 14 },
    chatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.sm, marginTop: t.spacing.sm },
    chatInputWrap: {
      flex: 1,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.inputBg,
      minHeight: 44,
      maxHeight: 120,
      justifyContent: 'center',
    },
    chatInput: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 10,
      fontSize: 16,
      color: t.colors.text,
      maxHeight: 120,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.5 },
  });
}
