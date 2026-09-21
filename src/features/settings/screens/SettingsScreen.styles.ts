import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: t.spacing.lg,
    },
    switchLabelCol: { flex: 1 },
    switchLabel: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    switchHint: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
    actions: { gap: t.spacing.md, marginTop: t.spacing.xl, width: '100%', alignSelf: 'stretch' },
    appearanceBody: { padding: t.spacing.lg },
    editProfileSection: { margin: t.spacing.lg, marginTop: 0 },
  });
}
