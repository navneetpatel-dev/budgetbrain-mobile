import { Platform, StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    heroRoot: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    panel: {
      flex: 1,
      backgroundColor: t.colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
        },
        android: { elevation: 10 },
        default: {},
      }),
    },
    panelCompact: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    panelHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.border,
      marginTop: t.spacing.md,
      marginBottom: t.spacing.sm,
    },
    panelHandleCompact: {
      width: 36,
    },
    panelScroll: {
      paddingHorizontal: t.spacing.xl,
      paddingTop: t.spacing.lg,
    },
    backWrap: {
      marginBottom: t.spacing.lg,
    },
    panelEyebrow: {
      ...t.typography.label,
      color: t.colors.primary,
      marginBottom: t.spacing.lg,
    },
    form: {
      gap: t.spacing.xs,
    },
    footer: {
      marginTop: t.spacing.lg,
      paddingTop: 0,
      alignItems: 'center',
    },
  });
}
