import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    suggestionCard: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: t.colors.surfaceContainer,
      borderWidth: 1,
      borderColor: t.colors.primary,
      marginBottom: t.spacing.md,
      gap: 8,
    },
    suggestionTitle: { fontSize: 13, fontWeight: '600', color: t.colors.text },
    suggestionBody: { fontSize: 12, color: t.colors.textTertiary },
    suggestionActions: { flexDirection: 'row', gap: 12 },
    applyText: { fontSize: 13, fontWeight: '700', color: t.colors.primary },
    dismissText: { fontSize: 13, fontWeight: '600', color: t.colors.textTertiary },
    categoryBlock: { marginTop: t.spacing.lg },
  });
}
