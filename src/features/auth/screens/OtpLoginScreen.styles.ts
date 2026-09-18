import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    actions: {
      gap: t.spacing.md,
      marginTop: t.spacing.xs,
    },
  });
}
