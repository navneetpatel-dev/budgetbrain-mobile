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
import { createStyles } from './AiScreen.styles';

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
