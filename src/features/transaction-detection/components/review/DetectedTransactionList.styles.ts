import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    listContainer: {
      paddingVertical: theme.spacing.sm,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      marginTop: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      ...theme.typography.titleSm,
      color: theme.colors.text,
      textAlign: 'center',
    },
    emptySubtitle: {
      ...theme.typography.body,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
    },
  });
}
