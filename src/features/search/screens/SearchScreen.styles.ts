import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    searchDock: {
      backgroundColor: t.colors.surfaceContainerLow ?? t.colors.surface,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.xs,
      paddingBottom: t.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      gap: 10,
    },
    textInput: {
      flex: 1,
      color: t.colors.text,
      fontSize: 15,
      paddingVertical: 0,
    },
    clearBtn: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipsRow: {
      marginTop: 8,
    },
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
    },
    separator: {
      height: 8,
    },
    hintContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    hintIconPod: {
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.12)' : t.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    hintTitle: {
      ...t.typography.titleSm,
      color: t.colors.text,
      fontWeight: '700',
    },
    hintText: {
      ...t.typography.bodyMedium,
      textAlign: 'center',
      color: t.colors.textSecondary,
      maxWidth: 260,
      lineHeight: 20,
      fontSize: 13,
    },
  });
}
