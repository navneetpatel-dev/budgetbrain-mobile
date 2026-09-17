import { useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AiChatSkeleton, AppHeaderBar } from '@/shared/components/ui';
import { BrandMark } from '@/shared/components/brand/BrandMark';
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
    <View style={styles.root}>
      <AppHeaderBar
        title="BudgetBrain"
        subtitle="AI Financial Intelligence"
        rightAction={
          messages.length > 0 ? (
            <Pressable
              onPress={startNewConversation}
              style={({ pressed }) => [styles.newChatBtn, pressed && { opacity: 0.75 }]}
              accessibilityRole="button"
              accessibilityLabel="Start new conversation"
            >
              <AppIcon name="add" size={16} color={theme.colors.primary} />
              <Text style={styles.newChatText}>New Chat</Text>
            </Pressable>
          ) : undefined
        }
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
            <View style={styles.emptyContainer}>
              {/* Glowing Aura Neural Card */}
              <View style={styles.heroAuraCard}>
                <LinearGradient
                  colors={['rgba(14, 165, 233, 0.12)', 'rgba(139, 92, 246, 0.08)', 'transparent']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
                <View style={styles.brandMarkWrapper}>
                  <BrandMark size={56} />
                </View>
                <Text style={styles.heroTitle}>Autonomous Financial Intelligence</Text>
                <Text style={styles.heroSubtitle}>
                  Ask anything about your spending habits, cashflow trends, budget limits, or receive actionable wealth optimization tips.
                </Text>

                {/* Quick Feature Pills */}
                <View style={styles.capabilityRow}>
                  <View style={styles.capabilityPill}>
                    <AppIcon name="shield" size={13} color={theme.colors.secondary} />
                    <Text style={styles.capabilityText}>Budget Guard</Text>
                  </View>
                  <View style={styles.capabilityPill}>
                    <AppIcon name="trendingUp" size={13} color={theme.colors.primary} />
                    <Text style={styles.capabilityText}>Run-rate Analysis</Text>
                  </View>
                  <View style={styles.capabilityPill}>
                    <AppIcon name="sparkles" size={13} color={theme.colors.violet} />
                    <Text style={styles.capabilityText}>Smart Forecasts</Text>
                  </View>
                </View>
              </View>
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
    </View>
  );
}

function createStyles(
  t: ReturnType<typeof useTheme>,
  horizontalPadding: number,
  footerBottom: number,
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    flex: { flex: 1 },
    newChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.12)' : t.colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    newChatText: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.primary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: t.spacing.md,
      paddingBottom: footerBottom + 80,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: t.spacing.xl,
    },
    heroAuraCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    brandMarkWrapper: {
      marginBottom: 16,
    },
    heroTitle: {
      ...t.typography.titleSm,
      fontSize: 18,
      fontWeight: '800',
      color: t.colors.text,
      textAlign: 'center',
      letterSpacing: -0.3,
      marginBottom: 8,
    },
    heroSubtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
      fontSize: 13,
      maxWidth: 300,
      marginBottom: 20,
    },
    capabilityRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    capabilityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
    },
    capabilityText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    messages: {
      gap: t.spacing.md,
      paddingVertical: t.spacing.sm,
    },
  });
}
