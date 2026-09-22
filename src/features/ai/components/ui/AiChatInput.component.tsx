import { useMemo } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { FormErrorBanner } from '@/shared/components/ui/FormErrorBanner.component';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';
import { useBottomSafeInset } from '@/shared/hooks/useLayout.hook';
import { maxLen } from '@/shared/validation/fieldLimits';
import {
  AI_FOLLOW_UP_SUGGESTIONS,
  AI_STARTER_SUGGESTIONS,
} from '@/features/ai/constants/suggestions';
import { createStyles } from './AiChatInput.styles';

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
