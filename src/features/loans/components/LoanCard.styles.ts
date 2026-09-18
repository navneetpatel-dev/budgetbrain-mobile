import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { marginBottom: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleCol: { flex: 1 },
    name: { ...t.typography.titleSm, color: t.colors.text },
    type: { ...t.typography.caption, color: t.colors.textTertiary, textTransform: 'capitalize', marginTop: 2 },
    remaining: { ...t.typography.amount, color: t.colors.text },
    principal: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
  });
}
