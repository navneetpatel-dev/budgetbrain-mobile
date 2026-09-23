import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.warningSoft,
      borderRadius: theme.radii.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...theme.typography.bodySemibold,
      color: theme.colors.text,
      fontSize: 14,
    },
    description: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.sm,
    },
    actionText: {
      ...theme.typography.caption,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
  });
}
