import { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input } from '@/src/components/ui';
import { apiGet, apiPost } from '@/src/services/api';
import { useAppSelector } from '@/src/store/hooks';
import { COLORS } from '@/src/constants/config';
import type { AiAnomaly, AiChatMessage, AiInsight } from '@/src/types';

export default function AiScreen() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');
  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiGet<AiInsight>('/ai/insights'),
    enabled: isPremium,
    retry: false,
  });

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['ai-anomalies'],
    queryFn: () => apiGet<{ anomalies: AiAnomaly[] }>('/ai/anomalies'),
    enabled: isPremium,
    retry: false,
  });

  if (!isPremium) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>AI Coach is Premium</Text>
        <Text style={styles.gateSubtitle}>Get spending insights, anomaly detection, and a personal finance coach</Text>
        <Button title="Upgrade to Premium" onPress={() => router.push('/subscription')} />
      </View>
    );
  }

  const sendMessage = async () => {
    if (!message.trim()) return;
    setChatLoading(true);
    const userMsg: AiChatMessage = { role: 'user', content: message, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    try {
      const result = await apiPost<{ conversationId: string; message: AiChatMessage; messages: AiChatMessage[] }>(
        '/ai/chat',
        { message: userMsg.content, conversationId }
      );
      setConversationId(result.conversationId);
      setMessages(result.messages);
    } catch {
      Alert.alert('Error', 'Could not send message');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Spending Insights</Text>
      {insightsLoading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        insights?.insights.map((insight, i) => (
          <Card key={i} style={styles.insightCard}>
            <Text style={styles.insightText}>{insight}</Text>
          </Card>
        ))
      )}

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Anomalies</Text>
      {anomaliesLoading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : anomalies?.anomalies?.length ? (
        anomalies.anomalies.map((a, i) => (
          <Card key={i} style={styles.insightCard}>
            <Text style={styles.anomalyReason}>{a.reason}</Text>
            <Text style={styles.anomalyMeta}>
              {a.merchant ?? 'Unknown'} · ₹{Number(a.amount).toLocaleString()} · {a.date}
            </Text>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>No anomalies detected</Text>
      )}

      <Text style={[styles.sectionTitle, styles.sectionGap]}>Chat with Coach</Text>
      {messages.map((m, i) => (
        <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
          <Text style={m.role === 'user' ? styles.userText : styles.assistantText}>{m.content}</Text>
        </View>
      ))}
      <Input
        value={message}
        onChangeText={setMessage}
        placeholder="Ask about your spending..."
        multiline
      />
      <Button title="Send" onPress={sendMessage} loading={chatLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  gate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.background },
  gateTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  gateSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  sectionGap: { marginTop: 24 },
  insightCard: { marginBottom: 8 },
  insightText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  anomalyReason: { fontSize: 14, fontWeight: '600', color: COLORS.warning },
  anomalyMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  empty: { color: COLORS.textSecondary, fontSize: 14 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '85%' },
  userBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.border },
  userText: { color: '#fff', fontSize: 14 },
  assistantText: { color: COLORS.text, fontSize: 14 },
});
