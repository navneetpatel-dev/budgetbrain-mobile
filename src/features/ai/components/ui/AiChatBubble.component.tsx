import { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import type { AiChatMessage } from '@/shared/types';
import { AiRichReply } from './AiRichReply.component';
import { createStyles, createTypingStyles } from './AiChatBubble.styles';

/**
 * Memoized: useAiChat.hook.ts replaces only the last element of the `messages` array on
 * every streamed token (see sendMessage's setMessages callback), so every earlier message
 * object keeps the same reference across renders — without memo, all of them still
 * re-rendered on every token because the parent (AiScreen) re-renders on each one.
 */
export const AiChatBubble = memo(function AiChatBubble({ message }: { message: AiChatMessage }) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const styles = useMemo(() => createStyles(theme, isUser), [theme, isUser]);

  if (isUser) {
    return (
      <View style={styles.row}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userBubble}
        >
          <Text style={styles.userText}>{message.content}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <AppIcon name="ai" size={14} color={theme.colors.primary} />
      </View>
      <View style={styles.assistantBubble}>
        <AiRichReply content={message.content} />
      </View>
    </View>
  );
});

export function AiTypingIndicator() {
  const theme = useTheme();
  const styles = useMemo(() => createTypingStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <AppIcon name="ai" size={14} color={theme.colors.primary} />
      </View>
      <View style={styles.bubble}>
        <Text style={styles.label}>Thinking</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotMid]} />
          ))}
        </View>
      </View>
    </View>
  );
}
