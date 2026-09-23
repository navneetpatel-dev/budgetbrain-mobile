import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      gap: 6,
      alignSelf: 'center',
      marginVertical: theme.spacing.xs,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    dotActive: {
      backgroundColor: theme.colors.success,
    },
    dotSyncing: {
      backgroundColor: theme.colors.primary,
    },
    dotOffline: {
      backgroundColor: theme.colors.warning,
    },
    text: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontSize: 11,
    },
  });
}
