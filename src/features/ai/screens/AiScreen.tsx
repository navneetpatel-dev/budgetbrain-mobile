import { useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AiChatSkeleton, ScreenContainer } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useAiChat } from '@/features/ai/hooks/useAiChat';
import {
  AiChatBubble,
  AiTypingIndicator,
  AiChatInput,
} from '@/features/ai/components';

export function AiScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tabBarPaddingX } = useResponsive();
  const footerBottom = Math.max(insets.bottom, 12) + theme.spacing.md;
  const styles = useMemo(
    () => createStyles(theme, tabBarPaddingX, footerBottom),
    [theme, tabBarPaddingX, footerBottom],
  );
  const scrollRef = useRef<ScrollView>(null);
  const {
    message,
    setMessage,
    chatLoading,
    messages,
    historyLoading,
    sendMessage,
    startNewConversation,
    chatError,
  } = useAiChat();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, chatLoading]);

  if (historyLoading) {
    return <AiChatSkeleton />;
  }

  const isEmpty = messages.length === 0 && !chatLoading;

  return (
    <ScreenContainer padded={false} style={styles.root}>
      <ProfileStackHeader
        screen="ai"
        subtitle="Ask about your finances"
        actionIcon={messages.length > 0 ? 'add' : undefined}
        actionLabel="New conversation"
        onAction={messages.length > 0 ? startNewConversation : undefined}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isEmpty ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <AppIcon name="ai" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>How can I help?</Text>
              <Text style={styles.emptySubtitle}>
                Ask about spending, savings, budgets, or get personalized tips from your data.
              </Text>
            </View>
          ) : (
            <View style={styles.messages}>
              {messages.map((m, i) => (
                <AiChatBubble key={i} message={m} />
              ))}
              {chatLoading && <AiTypingIndicator />}
            </View>
          )}
        </ScrollView>

        <AiChatInput
          message={message}
          onChangeMessage={setMessage}
          onSend={sendMessage}
          loading={chatLoading}
          suggestionMode={isEmpty ? 'starter' : 'followup'}
          error={chatError}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(
  t: ReturnType<typeof useTheme>,
  horizontalPadding: number,
  footerBottom: number,
) {
  return StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: t.spacing.md,
      paddingBottom: footerBottom + 80,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: t.spacing.md,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    emptyTitle: { ...t.typography.titleSm, color: t.colors.text, fontWeight: '700' },
    emptySubtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 280,
    },
    messages: { gap: t.spacing.md },
  });
}
