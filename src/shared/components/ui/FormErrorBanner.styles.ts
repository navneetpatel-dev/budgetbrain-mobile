import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      backgroundColor: t.colors.dangerSoft,
      borderRadius: t.radii.lg,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.danger + '33',
      marginTop: t.spacing.md,
      marginBottom: t.spacing.lg,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.colors.danger + '22',
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: { ...t.typography.bodyMedium, color: t.colors.text, flex: 1, lineHeight: 22 },
  });
}
