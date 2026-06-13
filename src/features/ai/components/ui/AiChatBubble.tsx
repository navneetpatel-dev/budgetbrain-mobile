import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AiChatMessage } from '@/shared/types';

export function AiChatBubble({ message }: { message: AiChatMessage }) {
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
        <Text style={styles.assistantText}>{message.content}</Text>
      </View>
    </View>
  );
}

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

function createStyles(t: ReturnType<typeof useTheme>, isUser: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: t.spacing.md,
      maxWidth: '100%',
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
      marginBottom: 2,
    },
    userBubble: {
      maxWidth: '82%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      borderBottomRightRadius: 6,
    },
    userText: { color: t.colors.onPrimary, fontSize: 15, lineHeight: 21 },
    assistantBubble: {
      maxWidth: '82%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      borderBottomLeftRadius: 6,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    assistantText: { color: t.colors.text, fontSize: 15, lineHeight: 21 },
  });
}

function createTypingStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: t.spacing.md },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      borderBottomLeftRadius: 6,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    label: { ...t.typography.caption, color: t.colors.textSecondary },
    dots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: t.colors.primary,
      opacity: 0.45,
    },
    dotMid: { opacity: 0.85 },
  });
}
