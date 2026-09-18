import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      padding: t.spacing.lg,
    },
    empty: {
      paddingVertical: t.spacing.xl,
      paddingHorizontal: t.spacing.lg,
      alignItems: 'center',
    },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.sm,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: '600',
      color: t.colors.text,
    },
    emptyHint: {
      fontSize: 13,
      fontWeight: '500',
      color: t.colors.textTertiary,
      marginTop: 4,
    },
  });
}
