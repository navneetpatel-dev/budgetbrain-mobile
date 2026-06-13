import { useState } from 'react';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/src/shared/services/api';
import { useAppSelector } from '@/src/shared/store/hooks';
import type { AiAnomaly, AiChatMessage, AiInsight } from '@/src/shared/types';

export function useAiChat() {
  const user = useAppSelector((s) => s.auth.user);
  const currency = user?.currency ?? 'INR';
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

  return {
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
  };
}
