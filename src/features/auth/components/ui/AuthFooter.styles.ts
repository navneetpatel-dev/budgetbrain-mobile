import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>, centered: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: centered ? 'center' : 'flex-start',
      alignItems: 'center',
      marginTop: 0,
      flexWrap: 'wrap',
      gap: 4,
    },
    text: { ...t.typography.bodyMedium, color: t.colors.textSecondary },
    link: { ...t.typography.bodySemibold, color: t.colors.primary },
    linkRight: { alignSelf: 'flex-end', marginBottom: t.spacing.sm },
    linkCenter: { alignSelf: 'center', marginTop: t.spacing.md },
  });
}
