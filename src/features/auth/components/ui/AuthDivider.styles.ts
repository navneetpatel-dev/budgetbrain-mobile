import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: t.spacing.lg,
      gap: t.spacing.md,
    },
    line: { flex: 1, height: 1, backgroundColor: t.colors.border },
    label: { ...t.typography.caption, color: t.colors.textTertiary },
  });
}
