import { Platform, StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

const COMPOSER_MIN_HEIGHT = 48;
const SEND_SIZE = 36;

export function createStyles(t: ReturnType<typeof useTheme>, bottomPad: number, horizontalPadding: number) {
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
