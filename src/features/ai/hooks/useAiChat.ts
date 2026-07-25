import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type { AiAnomaly, AiChatMessage, AiConversation, AiConversationSummary, AiInsight } from '@/shared/types';

function visibleMessages(messages: AiChatMessage[] | null | undefined): AiChatMessage[] {
  if (!Array.isArray(messages)) return [];
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
  const [chatError, setChatError] = useState<string | null>(null);
  const seededFromId = useRef<string | null>(null);
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

  const {
    data: conversationSummaries,
    isLoading: conversationsLoading,
    isFetched: conversationsFetched,
  } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => apiGet<AiConversationSummary[]>('/ai/conversations'),
    enabled: isPremium,
    retry: false,
  });

  const latestConversationId = conversationSummaries?.[0]?.id;

  const {
    data: latestConversation,
    isLoading: conversationLoading,
    isFetched: conversationFetched,
    isError: conversationError,
  } = useQuery({
    queryKey: ['ai-conversation', latestConversationId],
    queryFn: () => apiGet<AiConversation>(`/ai/conversations/${latestConversationId}`),
    enabled: isPremium && !!latestConversationId,
    retry: false,
  });

  useEffect(() => {
    if (!isPremium) {
      seededFromId.current = null;
      setConversationId(undefined);
      setMessages([]);
      return;
    }
    if (!latestConversation?.id) return;
    if (seededFromId.current === latestConversation.id) return;

    seededFromId.current = latestConversation.id;
    setConversationId(latestConversation.id);
    setMessages(visibleMessages(latestConversation.messages));
  }, [isPremium, latestConversation]);

  const historyLoading =
    isPremium &&
    (!conversationsFetched ||
      conversationsLoading ||
      (!!latestConversationId && !conversationFetched && !conversationError) ||
      (!!latestConversationId && conversationLoading));

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
      seededFromId.current = result.conversationId;
      setMessages(visibleMessages(result.messages));
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setChatError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setChatLoading(false);
    }
  };

  const startNewConversation = () => {
    seededFromId.current = null;
    setConversationId(undefined);
    setMessages([]);
    setChatError(null);
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
    historyLoading,
    sendMessage,
    startNewConversation,
    chatError,
    clearChatError,
  };
}
