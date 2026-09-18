import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      backgroundColor: t.colors.primarySoft,
      borderRadius: t.radii.lg,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.primary + '22',
      marginBottom: t.spacing.lg,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.primary + '18',
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: { ...t.typography.bodyMedium, color: t.colors.text, flex: 1, lineHeight: 22 },
  });
}
