import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
      paddingBottom: 80,
    },
    headerBlock: {
      marginBottom: t.spacing.md,
    },
    separator: {
      height: 10,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    unreadCard: {
      borderColor: t.colors.primary + '40',
      backgroundColor: t.colors.primarySoft,
    },
    iconCol: {
      paddingTop: 2,
    },
    iconPod: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentCol: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: {
      ...t.typography.bodyMedium,
      fontWeight: '600',
      color: t.colors.text,
      flex: 1,
    },
    unreadTitle: {
      fontWeight: '700',
      color: t.colors.text,
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: t.colors.primary,
      marginLeft: 6,
    },
    body: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    date: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: 8,
      fontSize: 11,
      fontWeight: '500',
    },
  });
}
