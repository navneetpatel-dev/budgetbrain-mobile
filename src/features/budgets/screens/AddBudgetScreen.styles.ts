import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    rolloverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.lg,
    },
    rolloverCopy: { flex: 1 },
    rolloverTitle: { ...t.typography.bodySemibold, color: t.colors.text },
    rolloverCaption: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: t.spacing.xs / 2,
    },
  });
}
