import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';

export interface MacroCategoryItem {
  id: string;
  name: string;
  amount: number;
  pct: number;
  color: string;
}

export interface SegmentedMacroBarProps {
  items: MacroCategoryItem[];
  currency?: string;
  onItemPress?: (id: string) => void;
  showLegend?: boolean;
}

export function SegmentedMacroBar({
  items,
  currency = 'INR',
  onItemPress,
  showLegend = true,
}: SegmentedMacroBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!items.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No category distribution yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segmented Macro Bar */}
      <View style={styles.barTrack}>
        {items.map((item, index) => {
          const widthPct = `${Math.max(2, item.pct)}%` as const;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <View
              key={item.id}
              style={[
                styles.barSegment,
                {
                  width: widthPct,
                  backgroundColor: item.color,
                  borderTopLeftRadius: isFirst ? 6 : 0,
                  borderBottomLeftRadius: isFirst ? 6 : 0,
                  borderTopRightRadius: isLast ? 6 : 0,
                  borderBottomRightRadius: isLast ? 6 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* 2-Column Category Legend Grid */}
      {showLegend && (
        <View style={styles.legendGrid}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onItemPress?.(item.id)}
              disabled={!onItemPress}
              style={({ pressed }) => [styles.legendItem, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.legendLeft}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text style={styles.legendAmount} numberOfLines={1}>
                {formatCurrency(item.amount, currency)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
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
