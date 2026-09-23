import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primaryContainer || '#EEF2FF',
    },
    badgeText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
      fontSize: 10,
    },
  });
}
