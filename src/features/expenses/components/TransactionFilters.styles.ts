import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: { gap: 8, paddingBottom: 0 },
    block: { gap: 6 },
    dateRow: { flexDirection: 'row', gap: t.spacing.sm },
    dateField: { flex: 1 },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing.sm,
      marginTop: 4,
      paddingTop: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.borderSubtle,
    },
    clearBtn: {
      paddingVertical: 4,
      paddingRight: 8,
    },
    clearBtnPressed: { opacity: 0.75 },
    clearText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    applyBtn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.primary,
    },
    applyBtnPressed: { opacity: 0.88 },
    applyText: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.onPrimary,
    },
  });
}
