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
    groupPicker: { fontSize: 13, fontWeight: '600', color: t.colors.primary },
    memberRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: t.radii.md,
      borderWidth: 1.5,
      borderColor: t.colors.borderSubtle,
    },
    memberRowSelected: { borderColor: t.colors.primary, backgroundColor: t.colors.primarySoft },
    memberName: { fontSize: 14, fontWeight: '600', color: t.colors.text },
    shareInput: {
      minWidth: 70,
      textAlign: 'right',
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
      borderBottomWidth: 1,
      borderBottomColor: t.colors.primary,
    },
    actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    resultText: { fontSize: 13, color: t.colors.text, flex: 1 },
    settleAction: { fontSize: 12, fontWeight: '700', color: t.colors.primary },
    settledText: { fontSize: 12, fontWeight: '700', color: t.colors.success },
  });
}
