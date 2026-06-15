import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type { AiAnomaly, AiChatMessage, AiConversation, AiConversationSummary, AiInsight } from '@/shared/types';

function visibleMessages(messages: AiChatMessage[]): AiChatMessage[] {
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
}

export function useAiChat() {
  const user = useAppSelector((s) => s.auth.user);
  const currency = user?.currency ?? 'INR';
  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');
  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const clearChatError = useCallback(() => setChatError(null), []);

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

  const { data: conversationSummaries, isLoading: conversationsLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiGet<AiConversationSummary[]>('/ai/conversations'),
    enabled: isPremium,
    retry: false,
  });

  const latestConversationId = conversationSummaries?.[0]?.id;

  const { data: latestConversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['ai-conversation', latestConversationId],
    queryFn: () => apiGet<AiConversation>(`/ai/conversations/${latestConversationId}`),
    enabled: isPremium && !!latestConversationId && !historyLoaded,
    retry: false,
  });

  useEffect(() => {
    if (!isPremium || conversationsLoading) return;
    if (!latestConversationId) {
      setHistoryLoaded(true);
    }
  }, [isPremium, conversationsLoading, latestConversationId]);

  useEffect(() => {
    if (!latestConversationId || historyLoaded) return;
    if (latestConversation) {
      setConversationId(latestConversation.id);
      setMessages(visibleMessages(latestConversation.messages));
      setHistoryLoaded(true);
      return;
    }
    if (!conversationLoading) {
      setHistoryLoaded(true);
    }
  }, [latestConversationId, latestConversation, conversationLoading, historyLoaded]);

  useEffect(() => {
    if (!isPremium) {
      setHistoryLoaded(false);
      setConversationId(undefined);
      setMessages([]);
    }
  }, [isPremium]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content) return;
    setChatLoading(true);
    setChatError(null);
    const userMsg: AiChatMessage = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    try {
      const result = await apiPost<{ conversationId: string; message: AiChatMessage; messages: AiChatMessage[] }>(
        '/ai/chat',
        { message: userMsg.content, conversationId }
      );
      setConversationId(result.conversationId);
      setMessages(visibleMessages(result.messages));
      setHistoryLoaded(true);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setChatError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setChatLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setHistoryLoaded(true);
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
    historyLoading: isPremium && !historyLoaded,
    sendMessage,
    startNewConversation,
    chatError,
    clearChatError,
  };
}
