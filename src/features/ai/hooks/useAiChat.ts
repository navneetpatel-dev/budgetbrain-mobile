import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppSelector } from '@/shared/store/hooks';
import type {
  AiAnomaly,
  AiChatMessage,
  AiChatResponse,
  AiConversation,
  AiConversationSummary,
  AiInsight,
} from '@/shared/types';

function visibleMessages(messages: AiChatMessage[] | null | undefined): AiChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => m.role === 'user' || m.role === 'assistant');
}

function asConversationList(data: unknown): AiConversationSummary[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { conversations?: unknown }).conversations)) {
    return (data as { conversations: AiConversationSummary[] }).conversations;
  }
  return [];
}

export function useAiChat() {
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const currency = user?.currency ?? 'INR';
  const authenticated = !!user;
  const [message, setMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  /** When true, stay on an empty draft until user sends or leaves the screen. */
  const draftNewChat = useRef(false);
  const messagesCountRef = useRef(0);
  const clearChatError = useCallback(() => setChatError(null), []);

  messagesCountRef.current = messages.length;

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiGet<AiInsight>('/ai/insights'),
    enabled: authenticated,
    retry: false,
  });

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['ai-anomalies'],
    queryFn: () => apiGet<{ anomalies: AiAnomaly[] }>('/ai/anomalies'),
    enabled: authenticated,
    retry: false,
  });

  const loadLatestConversation = useCallback(async () => {
    if (!authenticated) {
      setHistoryLoading(false);
      return;
    }

    if (messagesCountRef.current === 0) {
      setHistoryLoading(true);
    }

    try {
      // Always hit the network when entering AI Coach — don't trust stale cache
      const list = asConversationList(
        await apiGet<AiConversationSummary[] | { conversations: AiConversationSummary[] }>('/ai/conversations'),
      );
      queryClient.setQueryData(['ai-conversations'], list);

      const latestId = list[0]?.id;
      if (!latestId) {
        if (!draftNewChat.current) {
          setConversationId(undefined);
          setMessages([]);
        }
        return;
      }

      const conversation = await apiGet<AiConversation>(`/ai/conversations/${latestId}`);
      queryClient.setQueryData(['ai-conversation', latestId], conversation);

      if (draftNewChat.current) return;

      setConversationId(conversation.id);
      setMessages(visibleMessages(conversation.messages));
    } catch (err) {
      if (messagesCountRef.current === 0) {
        setChatError(getApiErrorMessage(err, 'Could not load conversation'));
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [authenticated, queryClient]);

  useFocusEffect(
    useCallback(() => {
      // Returning to the screen should always restore the latest saved thread
      draftNewChat.current = false;
      void loadLatestConversation();
    }, [loadLatestConversation]),
  );

  const sendMessage = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content || chatLoading) return;
    setChatLoading(true);
    setChatError(null);
    draftNewChat.current = false;
    const userMsg: AiChatMessage = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setMessage('');
    try {
      const result = await apiPost<AiChatResponse>('/ai/chat', {
        message: userMsg.content,
        conversationId,
      });
      const nextMessages = visibleMessages(result.messages);
      const now = new Date().toISOString();

      setConversationId(result.conversationId);
      setMessages(nextMessages);

      queryClient.setQueryData<AiConversation>(['ai-conversation', result.conversationId], (prev) => ({
        id: result.conversationId,
        title: prev?.title ?? 'Conversation',
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
        messages: nextMessages,
      }));
      queryClient.setQueryData<AiConversationSummary[]>(['ai-conversations'], (prev) => {
        const existing = (prev ?? []).find((c) => c.id === result.conversationId);
        const rest = (prev ?? []).filter((c) => c.id !== result.conversationId);
        return [
          {
            id: result.conversationId,
            title: existing?.title ?? 'Conversation',
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          },
          ...rest,
        ];
      });
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setChatError(getApiErrorMessage(err, 'Could not send message'));
    } finally {
      setChatLoading(false);
    }
  };

  const startNewConversation = () => {
    draftNewChat.current = true;
    setConversationId(undefined);
    setMessages([]);
    setChatError(null);
    setHistoryLoading(false);
  };

  return {
    currency,
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
