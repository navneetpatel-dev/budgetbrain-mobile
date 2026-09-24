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
    status: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    undoButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    undoText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}
