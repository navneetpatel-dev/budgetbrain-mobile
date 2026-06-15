import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { FormErrorBanner } from '@/shared/components/ui/FormErrorBanner';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/utils/responsive';

const SUGGESTED_PROMPTS = [
  'Where did I overspend this month?',
  'How can I save more?',
  'Summarize my top categories',
];

interface AiChatInputProps {
  message: string;
  onChangeMessage: (text: string) => void;
  onSend: (text?: string) => void;
  loading: boolean;
  showSuggestions: boolean;
  error?: string | null;
}

export function AiChatInput({
  message,
  onChangeMessage,
  onSend,
  loading,
  showSuggestions,
  error,
}: AiChatInputProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tabBarPaddingX } = useResponsive();
  const styles = useMemo(
    () => createStyles(theme, insets.bottom, tabBarPaddingX),
    [theme, insets.bottom, tabBarPaddingX],
  );
  const canSend = !loading && message.trim().length > 0;

  return (
    <View style={styles.wrap}>
      {error ? <FormErrorBanner message={error} /> : null}
      {showSuggestions && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prompts}
          keyboardShouldPersistTaps="handled"
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              onPress={() => onSend(prompt)}
              style={({ pressed }) => [styles.promptChip, pressed && { opacity: 0.85 }]}
            >
              <AppIcon name="ai" size={12} color={theme.colors.primary} />
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputRow}>
        <View style={styles.inputShell}>
          <TextInput
            value={message}
            onChangeText={onChangeMessage}
            placeholder="Ask your finance coach..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            style={styles.input}
            accessibilityLabel="Chat message"
          />
        </View>
        <Pressable
          onPress={() => onSend()}
          disabled={!canSend}
          style={({ pressed }) => [styles.sendWrap, !canSend && styles.sendDisabled, pressed && canSend && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {canSend ? (
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.onPrimary} size="small" />
              ) : (
                <AppIcon name="chevronRight" size={20} color={theme.colors.onPrimary} />
              )}
            </LinearGradient>
          ) : (
            <View style={[styles.sendBtn, styles.sendBtnMuted]}>
              {loading ? (
                <ActivityIndicator color={theme.colors.textTertiary} size="small" />
              ) : (
                <AppIcon name="chevronRight" size={20} color={theme.colors.textTertiary} />
              )}
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, bottomInset: number, horizontalPadding: number) {
  return StyleSheet.create({
    wrap: {
      paddingTop: t.spacing.sm,
      paddingBottom: bottomInset + t.spacing.sm,
      paddingHorizontal: horizontalPadding,
      borderTopWidth: 1,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      backgroundColor: t.colors.background,
    },
    prompts: {
      gap: 6,
      paddingBottom: 6,
    },
    promptChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
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
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: t.spacing.sm,
    },
    inputShell: {
      flex: 1,
      minHeight: 44,
      maxHeight: 100,
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.border,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      justifyContent: 'center',
    },
    input: {
      paddingHorizontal: t.spacing.md,
      paddingVertical: 10,
      fontSize: 16,
      color: t.colors.text,
      maxHeight: 100,
    },
    sendWrap: {},
    sendDisabled: { opacity: 0.55 },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnMuted: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surfaceHover,
    },
  });
}
