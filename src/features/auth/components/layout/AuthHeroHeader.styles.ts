import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(
  t: ReturnType<typeof useTheme>,
  compact: boolean,
  branded: boolean,
) {
  return StyleSheet.create({
    wrap: {
      overflow: 'hidden',
    },
    glow: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    glowAccent: { width: 140, height: 140, top: -50, right: -40, backgroundColor: 'rgba(255,255,255,0.06)' },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: branded ? 'stretch' : 'center',
      paddingBottom: branded ? (compact ? t.spacing.lg : t.spacing.xl) : t.spacing.xxl + 8,
    },
    brandCluster: {
      alignSelf: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: branded && !compact ? 320 : undefined,
      gap: compact ? 6 : 8,
    },
    title: {
      fontSize: branded ? (compact ? 22 : 28) : 26,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.5,
      textAlign: 'center',
      lineHeight: branded ? (compact ? 24 : 30) : undefined,
    },
    titleAccent: {
      fontWeight: '800',
      color: 'rgba(255,255,255,0.92)',
    },
    tagline: {
      fontSize: compact ? 11 : 13,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.75)',
      textAlign: 'center',
      letterSpacing: 0.15,
      lineHeight: compact ? 15 : 18,
    },
  });
}
