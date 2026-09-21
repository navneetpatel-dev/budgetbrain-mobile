import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: 28,
      paddingHorizontal: t.spacing.lg,
      paddingTop: 16,
      paddingBottom: 24,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
    },
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      alignSelf: 'center',
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      ...t.typography.title,
      fontSize: 20,
      fontWeight: '700',
      color: t.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 20,
      fontSize: 13,
    },
    closeBtn: {
      padding: 6,
      borderRadius: 20,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
      alignSelf: 'flex-end',
    },
    errorText: {
      ...t.typography.caption,
      color: t.colors.danger,
      textAlign: 'center',
      marginBottom: 12,
      fontWeight: '600',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginVertical: 20,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: t.colors.textTertiary,
      backgroundColor: 'transparent',
    },
    dotFilled: {
      borderColor: t.colors.primary,
      backgroundColor: t.colors.primary,
    },
    keypadGrid: {
      alignSelf: 'center',
      width: 280,
      gap: 14,
      marginTop: 10,
    },
    keypadRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    keyButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyButtonPressed: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    },
    keyText: {
      fontSize: 26,
      fontWeight: '600',
      color: t.colors.text,
    },
    keyEmpty: {
      width: 68,
      height: 68,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    retryBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    },
  });
}
