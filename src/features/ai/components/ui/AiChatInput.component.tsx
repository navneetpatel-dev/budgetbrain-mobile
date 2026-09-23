import { memo, useMemo } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { FormErrorBanner } from '@/shared/components/ui/FormErrorBanner.component';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import { maxLen } from '@/shared/validation/fieldLimits';
import {
  AI_FOLLOW_UP_SUGGESTIONS,
  AI_STARTER_SUGGESTIONS,
} from '@/features/ai/constants/suggestions';
import { createStyles } from './AiChatInput.styles';

const PromptChip = memo(function PromptChip({
  prompt,
  loading,
  onSend,
  styles,
  theme,
}: {
  prompt: string;
  loading: boolean;
  onSend: (text?: string) => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>;
}) {
  const spring = useSpringPress();

  return (
    <Pressable
      onPress={() => onSend(prompt)}
      onPressIn={spring.onPressIn}
      onPressOut={spring.onPressOut}
      disabled={loading}
      style={[styles.promptChip, loading && { opacity: 0.55 }]}
    >
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, spring.style]}>
        <AppIcon name="ai" size={12} color={theme.colors.primary} />
        <Text style={styles.promptText}>{prompt}</Text>
      </Animated.View>
    </Pressable>
  );
});

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
  const bottomSafe = useBottomSafeInset();
  const { tabBarPaddingX } = useResponsive();
  const bottomPad = bottomSafe + theme.spacing.md;
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
  const sendSpring = useSpringPress();

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
              <PromptChip key={prompt} prompt={prompt} loading={loading} onSend={onSend} styles={styles} theme={theme} />
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
          onPressIn={canSend ? sendSpring.onPressIn : undefined}
          onPressOut={canSend ? sendSpring.onPressOut : undefined}
          disabled={!canSend}
          style={[styles.sendWrap, !canSend && !loading && styles.sendWrapDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
        >
          <Animated.View style={sendSpring.style}>
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
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
