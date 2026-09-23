import { Platform, StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(t: AppTheme, tabBarPaddingX: number) {
  return StyleSheet.create({
    outer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: tabBarPaddingX,
      paddingTop: t.spacing.xs,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      backgroundColor: t.colors.tabBar,
      borderRadius: t.radii.xl + 4,
      borderWidth: 1,
      borderColor: t.colors.tabBarBorder,
      paddingHorizontal: t.spacing.sm,
      paddingTop: t.spacing.sm,
      paddingBottom: t.spacing.sm,
      minHeight: 64,
      ...t.shadows.lg,
      ...Platform.select({ android: { elevation: 12 } }),
    },
    side: {
      flex: 1,
      flexDirection: 'row',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
      gap: 3,
      minHeight: 52,
    },
    tabPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
    iconIdle: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textTertiary,
      letterSpacing: 0.2,
    },
    labelActive: {
      color: t.colors.primary,
      fontWeight: '700',
    },
    indicator: {
      width: 16,
      height: 3,
      borderRadius: 2,
      marginTop: 1,
      backgroundColor: 'transparent',
    },
    fab: {
      marginTop: -20,
      marginHorizontal: t.spacing.xs,
      borderRadius: 24,
      ...t.shadows.lg,
      borderWidth: 4,
      borderColor: t.colors.background,
    },
    fabGradient: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
