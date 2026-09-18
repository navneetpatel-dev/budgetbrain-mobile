import { StyleSheet } from 'react-native';

export function createResponsiveGridStyles(cols: number, gridGapValue: number) {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gridGapValue,
    },
    item: {
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
      minWidth: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
      maxWidth: cols === 1 ? '100%' : cols === 2 ? '48%' : '31%',
    },
  });
}

export function createSummaryMetricsGridStyles(gridGapValue: number) {
  return StyleSheet.create({
    stack: { gap: gridGapValue },
    row: { flexDirection: 'row', alignItems: 'stretch', gap: gridGapValue },
    cell: { flex: 1, minWidth: 0 },
    quad: { flex: 1, minWidth: 0 },
  });
}
