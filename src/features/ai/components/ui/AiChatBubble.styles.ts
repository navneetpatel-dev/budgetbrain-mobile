import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>, isUser: boolean) {
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
      maxWidth: '86%',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 18,
      borderBottomLeftRadius: 6,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
  });
}

export function createTypingStyles(t: ReturnType<typeof useTheme>) {
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
