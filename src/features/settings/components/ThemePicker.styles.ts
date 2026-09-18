import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    modeRow: { flexDirection: 'row', gap: t.spacing.sm },
    modeBtn: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: t.spacing.md,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceHover,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    modeBtnActive: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
    modeLabel: { ...t.typography.caption, color: t.colors.textSecondary },
    modeLabelActive: { color: t.colors.primary, fontWeight: '700' },
    accentLabel: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: t.spacing.lg,
      marginBottom: t.spacing.sm,
    },
    accentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm },
    accentBtn: {
      alignItems: 'center',
      padding: t.spacing.sm,
      borderRadius: t.radii.md,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: 58,
    },
    accentBtnActive: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
    swatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    swatchCheck: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: t.colors.onPrimary,
      borderWidth: 2,
      borderColor: 'rgba(0,0,0,0.15)',
    },
    accentName: { ...t.typography.caption, fontSize: 10, color: t.colors.textTertiary },
    accentNameActive: { color: t.colors.primary, fontWeight: '700' },
  });
}
