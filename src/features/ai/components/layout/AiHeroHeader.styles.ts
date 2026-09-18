import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      backgroundColor: t.colors.background,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surfaceHover,
    },
    titleGroup: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    title: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      fontSize: 16,
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginTop: 1,
    },
  });
}
