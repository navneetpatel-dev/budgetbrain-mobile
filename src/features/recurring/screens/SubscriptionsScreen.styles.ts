import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginBottom: t.spacing.sm },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    merchant: { ...t.typography.bodySemibold, fontWeight: '700', color: t.colors.text },
    meta: { ...t.typography.caption, marginTop: 4, textTransform: 'capitalize', color: t.colors.textSecondary },
    actions: { gap: 8, alignItems: 'flex-end' },
    actionText: { ...t.typography.caption, fontWeight: '700', color: t.colors.primary },
    addRow: { paddingVertical: 10 },
    addRowText: { ...t.typography.bodySemibold, color: t.colors.primary },
  });
}
