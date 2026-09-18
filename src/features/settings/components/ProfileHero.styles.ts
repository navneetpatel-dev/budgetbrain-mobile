import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.lg,
      overflow: 'hidden',
      borderBottomLeftRadius: t.radii.xl,
      borderBottomRightRadius: t.radii.xl,
    },
    orb: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    orbRight: { width: 120, height: 120, top: -30, right: -40 },
    orbLeft: { width: 80, height: 80, bottom: -20, left: -20 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    avatarRing: {
      borderRadius: 999,
      padding: 2,
    },
    avatarRingGradient: {
      borderRadius: 999,
      padding: 2,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '800',
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    email: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 13,
      marginTop: 2,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 8,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      borderWidth: 1,
    },
    roleText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    currencyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    currencyText: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 10,
      fontWeight: '700',
    },
  });
}
