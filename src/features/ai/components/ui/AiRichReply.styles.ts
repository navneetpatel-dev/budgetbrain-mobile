import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: { gap: 10 },
    heading: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
    },
    paragraph: {
      color: t.colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    listCard: {
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.background,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    listLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      flexShrink: 1,
      minWidth: 0,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 7,
      backgroundColor: t.colors.primary,
      opacity: 0.75,
    },
    listLabel: {
      fontSize: 13,
      lineHeight: 20,
      color: t.colors.textSecondary,
      flexShrink: 1,
    },
    listValue: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '700',
      color: t.colors.text,
      textAlign: 'right',
    },
    listValueAlone: {
      fontSize: 13,
      lineHeight: 20,
      color: t.colors.text,
    },
  });
}
