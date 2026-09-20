import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: { marginTop: t.spacing.lg },
    panel: {
      borderWidth: 1.5,
      borderColor: t.colors.borderSubtle,
      borderRadius: t.radii.lg,
      padding: t.spacing.md,
      gap: 10,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    accountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: t.radii.md,
      borderWidth: 1.5,
      borderColor: t.colors.borderSubtle,
    },
    accountRowSelected: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
    accountName: { fontSize: 14, fontWeight: '600', color: t.colors.text },
    accountMeta: { fontSize: 11, color: t.colors.textTertiary, marginTop: 2 },
    amountInput: {
      minWidth: 80,
      textAlign: 'right',
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.primary,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: t.colors.borderSubtle,
    },
    totalLabel: { fontSize: 12, color: t.colors.textTertiary },
    totalValue: { fontSize: 13, fontWeight: '700', color: t.colors.text },
    totalValueMismatch: { color: t.colors.danger },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    emptyText: { fontSize: 13, color: t.colors.textTertiary, paddingVertical: 8 },
  });
}
