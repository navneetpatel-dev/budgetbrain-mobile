import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      width: '100%',
      gap: t.spacing.md,
    },
    barTrack: {
      width: '100%',
      height: 12,
      borderRadius: 6,
      backgroundColor: t.colors.surfaceHover,
      flexDirection: 'row',
      overflow: 'hidden',
      gap: 2,
      padding: 1.5,
    },
    barSegment: {
      height: '100%',
    },
    legendGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 10,
      columnGap: 12,
      paddingTop: 4,
    },
    legendItem: {
      width: '48%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    legendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    colorDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },
    legendName: {
      fontSize: 13,
      color: t.colors.textSecondary,
      fontWeight: '500',
      flex: 1,
    },
    legendAmount: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
    },
    emptyWrap: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: t.colors.textTertiary,
    },
  });
}
