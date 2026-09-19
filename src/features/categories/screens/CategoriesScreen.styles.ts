import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    catCard: { marginBottom: 0 },
    catCardActive: {
      opacity: 0.92,
      shadowColor: t.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
    },
    catRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    catName: { flex: 1, fontSize: 15, fontWeight: '600', color: t.colors.text },
    actions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    iconBtn: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      backgroundColor: t.colors.primary + '14',
    },
    iconBtnDanger: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      backgroundColor: t.colors.danger + '12',
    },
    iconBtnPressed: { opacity: 0.72, transform: [{ scale: 0.94 }] },
  });
}
