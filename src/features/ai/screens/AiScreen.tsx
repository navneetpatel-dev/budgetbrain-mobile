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
import { ScreenContainer } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useAiChat } from '@/features/ai/hooks/useAiChat';
import {
  AiHeroHeader,
  AiChatBubble,
  AiTypingIndicator,
  AiChatInput,
  AiPremiumGate,
} from '@/features/ai/components';

export function AiScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { screenPaddingX } = useResponsive();
  const footerBottom = insets.bottom + theme.spacing.sm;
  const styles = useMemo(
    () => createStyles(theme, screenPaddingX, footerBottom),
    [theme, screenPaddingX, footerBottom],
  );
  const scrollRef = useRef<ScrollView>(null);
  const {
    isPremium,
    message,
    setMessage,
    chatLoading,
    messages,
    sendMessage,
  } = useAiChat();

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, chatLoading]);

  if (!isPremium) {
    return <AiPremiumGate />;
  }

  const isEmpty = messages.length === 0 && !chatLoading;

  return (
    <ScreenContainer padded={false} style={styles.root}>
      <AiHeroHeader />

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

        <View style={styles.footer}>
          <AiChatInput
            message={message}
            onChangeMessage={setMessage}
            onSend={sendMessage}
            loading={chatLoading}
            showSuggestions={isEmpty}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(
  t: ReturnType<typeof useTheme>,
  screenPaddingX: number,
  footerBottom: number,
) {
  return StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: screenPaddingX,
      paddingTop: t.spacing.lg,
      paddingBottom: t.spacing.md,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: t.spacing.lg,
      minHeight: 200,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
      marginBottom: t.spacing.md,
    },
    emptyTitle: {
      ...t.typography.titleSm,
      color: t.colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      textAlign: 'center',
      marginTop: t.spacing.sm,
      lineHeight: 22,
      maxWidth: 300,
    },
    messages: {
      gap: t.spacing.xs,
    },
    footer: {
      marginBottom: footerBottom,
      backgroundColor: t.colors.background,
    },
  });
}
