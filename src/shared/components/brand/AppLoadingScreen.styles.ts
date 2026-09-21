import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markWrap: {
      width: 168,
      height: 168,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.xl,
    },
    ring: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 168,
      height: 168,
      borderRadius: 84,
      borderWidth: 2,
    },
    mark: {
      borderRadius: 28,
      overflow: 'hidden',
      ...t.shadows.md,
    },
    wordmark: {
      fontSize: 28,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.6,
    },
    wordmarkAccent: {
      color: t.colors.primary,
    },
    caption: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginTop: t.spacing.sm,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: t.spacing.lg,
      height: 12,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.colors.primary,
    },
  });
}
