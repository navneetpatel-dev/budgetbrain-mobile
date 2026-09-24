import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.colors.borderSubtle,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    info: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    title: {
      ...theme.typography.titleSm,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    amount: {
      ...theme.typography.amount,
      color: theme.colors.text,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    pill: {
      backgroundColor: theme.colors.surfaceContainerHighest,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radii.sm,
    },
    pillText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    deleteButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    deleteText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}
