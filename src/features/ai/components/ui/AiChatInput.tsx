import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { FormErrorBanner } from '@/shared/components/ui/FormErrorBanner';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { maxLen } from '@/shared/validation/fieldLimits';
import {
  AI_FOLLOW_UP_SUGGESTIONS,
  AI_STARTER_SUGGESTIONS,
} from '@/features/ai/constants/suggestions';

const COMPOSER_MIN_HEIGHT = 48;
const SEND_SIZE = 36;

interface AiChatInputProps {
  message: string;
  onChangeMessage: (text: string) => void;
  onSend: (text?: string) => void;
  loading: boolean;
  suggestionMode?: 'starter' | 'followup' | 'hidden';
  error?: string | null;
}

export function AiChatInput({
  message,
  onChangeMessage,
  onSend,
  loading,
  suggestionMode = 'starter',
  error,
}: AiChatInputProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tabBarPaddingX } = useResponsive();
  const bottomPad = Math.max(insets.bottom, 12) + theme.spacing.md;
  const styles = useMemo(
    () => createStyles(theme, bottomPad, tabBarPaddingX),
    [theme, bottomPad, tabBarPaddingX],
  );
  const canSend = message.trim().length > 0 && !loading;
  const prompts =
    suggestionMode === 'followup'
      ? AI_FOLLOW_UP_SUGGESTIONS
      : suggestionMode === 'starter'
        ? AI_STARTER_SUGGESTIONS
        : [];
  const suggestionLabel = suggestionMode === 'followup' ? 'Continue with' : 'Suggested questions';

  return (
    <View style={styles.wrap}>
      {error ? <FormErrorBanner message={error} /> : null}
      {prompts.length > 0 ? (
        <View style={styles.suggestionsBlock}>
          <Text style={styles.suggestionsLabel}>{suggestionLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prompts}
            keyboardShouldPersistTaps="handled"
          >
            {prompts.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() => onSend(prompt)}
                disabled={loading}
                style={({ pressed }) => [
                  styles.promptChip,
                  pressed && { opacity: 0.85 },
                  loading && { opacity: 0.55 },
                ]}
              >
                <AppIcon name="ai" size={12} color={theme.colors.primary} />
                <Text style={styles.promptText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          value={message}
          onChangeText={onChangeMessage}
          placeholder="Ask your finance coach..."
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          maxLength={maxLen('aiMessage')}
          style={styles.input}
          accessibilityLabel="Chat message"
          editable={!loading}
        />
        <Pressable
          onPress={() => onSend()}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendWrap,
            pressed && canSend && { opacity: 0.9 },
            !canSend && !loading && styles.sendWrapDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
        >
          {loading ? (
            <View style={[styles.sendBtn, styles.sendBtnLoading]}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
            </View>
          ) : canSend ? (
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <AppIcon name="send" size={16} color={theme.colors.onPrimary} />
            </LinearGradient>
          ) : (
            <View style={[styles.sendBtn, styles.sendBtnMuted]}>
              <AppIcon name="send" size={16} color={theme.colors.textSecondary} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, bottomPad: number, horizontalPadding: number) {
  return StyleSheet.create({
    wrap: {
      paddingTop: t.spacing.sm,
      paddingBottom: bottomPad,
      paddingHorizontal: horizontalPadding,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      backgroundColor: t.colors.background,
      gap: t.spacing.sm,
    },
    suggestionsBlock: {
      gap: 6,
    },
    suggestionsLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    prompts: {
      gap: 8,
      paddingBottom: 2,
    },
    promptChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.primarySoft,
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    promptText: {
      ...t.typography.caption,
      color: t.colors.primary,
      fontWeight: '600',
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      minHeight: COMPOSER_MIN_HEIGHT,
      maxHeight: 120,
      paddingLeft: t.spacing.md,
      paddingRight: 6,
      paddingVertical: 6,
      gap: 8,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.12)' : t.colors.border,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.inputBg,
    },
    input: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
      color: t.colors.text,
      maxHeight: 100,
      paddingTop: Platform.OS === 'ios' ? 8 : 6,
      paddingBottom: Platform.OS === 'ios' ? 8 : 6,
      margin: 0,
      textAlignVertical: 'center',
    },
    sendWrap: {
      marginBottom: 0,
    },
    sendWrapDisabled: {
      opacity: 1,
    },
    sendBtn: {
      width: SEND_SIZE,
      height: SEND_SIZE,
      borderRadius: SEND_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnMuted: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.12)' : t.colors.surfaceHover,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.14)' : t.colors.borderSubtle,
    },
    sendBtnLoading: {
      backgroundColor: t.colors.primarySoft,
    },
  });
}
