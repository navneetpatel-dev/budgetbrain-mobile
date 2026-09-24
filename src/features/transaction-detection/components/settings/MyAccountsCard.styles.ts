import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    description: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: theme.spacing.sm,
    },
    inputFlex: {
      flex: 1,
    },
    addButton: {
      marginBottom: theme.spacing.md,
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.danger,
    },
  });
}
