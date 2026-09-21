import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(t: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    item: { gap: t.spacing.md },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
    itemIconWrap: {
      width: 40,
      height: 40,
      borderRadius: t.radii.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    itemBody: { flex: 1 },
    itemName: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    itemMeta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 },
  });
}
