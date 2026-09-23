import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSummary: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    countHighlight: {
      fontWeight: '700',
      color: theme.colors.text,
    },
    errorBanner: {
      backgroundColor: theme.colors.dangerSoft,
      padding: theme.spacing.md,
      margin: theme.spacing.md,
      borderRadius: theme.radii.md,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
