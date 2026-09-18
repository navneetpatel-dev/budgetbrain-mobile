import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.colors.background,
    },
    title: { ...t.typography.title, color: t.colors.text },
    subtitle: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginTop: t.spacing.sm },
  });
}
