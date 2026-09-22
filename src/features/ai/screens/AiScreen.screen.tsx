import { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  type ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AiChatSkeleton, AppHeaderBar } from '@/shared/components/ui';
import { BrandMark } from '@/shared/components/brand/BrandMark.component';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { useAiChat } from '@/features/ai/hooks/useAiChat.hook';
import { formatCurrency } from '@/shared/utils/currency';
import {
  AiChatBubble,
  AiTypingIndicator,
  AiChatInput,
  AiInsightCard,
  AiAnomalyCard,
  AiAnomalyClear,
} from '@/features/ai/components';
import { useEntitlement, PaywallModal } from '@/features/subscriptions';
import { createStyles } from './AiScreen.styles';
import type { AiChatMessage } from '@/shared/types';

function anomalyMeta(anomaly: { merchant?: string; amount?: number }, currency: string): string {
  const parts: string[] = [];
  if (anomaly.merchant) parts.push(anomaly.merchant);
  if (typeof anomaly.amount === 'number') parts.push(formatCurrency(anomaly.amount, currency));
  return parts.join(' · ');
}

/** No stable id on AiChatMessage — timestamp is set once per message at creation (including
 * the streaming placeholder) and never changes as content streams in, so it's a safe key. */
function keyExtractorMessage(item: AiChatMessage) {
  return item.timestamp;
}

export function AiScreen() {
  const theme = useTheme();
  const bottomSafe = useBottomSafeInset();
  const { tabBarPaddingX } = useResponsive();
  const footerBottom = bottomSafe + theme.spacing.md;
  const styles = useMemo(
    () => createStyles(theme, tabBarPaddingX, footerBottom),
    [theme, tabBarPaddingX, footerBottom],
  );
  const { isEntitled, paywallVisible, openPaywall, closePaywall } = useEntitlement();
  const {
    currency,
    message,
    setMessage,
    chatLoading,
    messages,
    historyLoading,
    sendMessage,
    startNewConversation,
    chatError,
    insights,
    anomalies,
  } = useAiChat();

  const handleSendMessage = () => {
    if (!isEntitled) {
      openPaywall();
      return;
    }
    sendMessage();
  };

  // Newest-first for the inverted FlatList below — an inverted list anchors new content at
  // the visual bottom automatically, no manual scrollToEnd needed.
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const renderMessage: ListRenderItem<AiChatMessage> = useCallback(
    ({ item }) => <AiChatBubble message={item} />,
    []
  );

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
        {isEmpty ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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

              {insights && insights.insights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.sectionLabel}>Spending Insights</Text>
                  {insights.insights.map((text, i) => (
                    <AiInsightCard key={i} text={text} />
                  ))}
                </View>
              )}

              <View style={styles.insightsSection}>
                <Text style={styles.sectionLabel}>Anomaly Detection</Text>
                {anomalies && anomalies.anomalies.length > 0 ? (
                  anomalies.anomalies.map((a, i) => (
                    <AiAnomalyCard
                      key={a.transactionId ?? a.recurringSeriesId ?? i}
                      type={a.type}
                      reason={a.reason}
                      meta={anomalyMeta(a, currency)}
                    />
                  ))
                ) : (
                  <AiAnomalyClear />
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            inverted
            data={invertedMessages}
            keyExtractor={keyExtractorMessage}
            renderItem={renderMessage}
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, styles.messages]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            // "Header" in an inverted list renders at the visual bottom (below the newest
            // message) — exactly where a typing indicator belongs.
            ListHeaderComponent={chatLoading ? <AiTypingIndicator /> : null}
          />
        )}

        <AiChatInput
          message={message}
          onChangeMessage={setMessage}
          onSend={handleSendMessage}
          loading={chatLoading}
          suggestionMode={isEmpty ? 'starter' : 'followup'}
          error={chatError}
        />
      </KeyboardAvoidingView>

      <PaywallModal
        visible={paywallVisible}
        onClose={closePaywall}
        featureTitle="Unlock AI Financial Advisor"
      />
    </View>
  );
}
