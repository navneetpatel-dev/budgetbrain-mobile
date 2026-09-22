import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    section: { marginTop: t.spacing.lg },
    heading: {
      fontWeight: '700',
      fontSize: 14,
      color: t.colors.text,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 12,
      backgroundColor: t.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      marginBottom: 8,
    },
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    meta: { flex: 1, minWidth: 0 },
    fileName: { fontWeight: '500', fontSize: 13, color: t.colors.text },
    fileSize: { fontWeight: '400', fontSize: 11, color: t.colors.textTertiary },
    notReady: { fontSize: 11, color: t.colors.textTertiary, marginTop: 2 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionBtn: { padding: 6 },
  });
}
