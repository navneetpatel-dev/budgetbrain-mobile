import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    list: {
      paddingVertical: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
    },
    empty: {
      padding: theme.spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
}
