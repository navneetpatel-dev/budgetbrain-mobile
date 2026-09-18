import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    accent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
      marginTop: 1,
    },
    text: {
      flex: 1,
      ...t.typography.bodyMedium,
      color: t.colors.text,
      lineHeight: 22,
    },
  });
}
