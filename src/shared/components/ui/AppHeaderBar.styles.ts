import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>, topInset: number) {
  return StyleSheet.create({
    container: {
      backgroundColor: t.colors.surfaceContainerLow,
      paddingTop: Math.max(topInset, 12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      zIndex: 50,
    },
    content: {
      height: 60,
      paddingHorizontal: t.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
      flex: 1,
      minWidth: 0,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    titleCol: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
      color: t.colors.text,
      fontFamily: t.typography.titleSm.fontFamily,
      lineHeight: 19,
    },
    subtitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
      fontFamily: t.typography.label.fontFamily,
      lineHeight: 14,
      marginTop: 1,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.surfaceHover,
    },
    btnPressed: {
      transform: [{ scale: 0.94 }],
      opacity: 0.85,
    },
    avatarPressable: {
      padding: 1,
    },
    avatarGradientRing: {
      width: 36,
      height: 36,
      borderRadius: 18,
      padding: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInner: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: t.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}
