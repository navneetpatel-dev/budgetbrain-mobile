import { memo, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import { createStyles } from './SegmentedMacroBar.styles';

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

const LegendItem = memo(function LegendItem({
  item,
  currency,
  onItemPress,
  styles,
}: {
  item: MacroCategoryItem;
  currency: string;
  onItemPress?: (id: string) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const spring = useSpringPress(0.98);

  return (
    <Pressable
      onPress={() => onItemPress?.(item.id)}
      onPressIn={spring.onPressIn}
      onPressOut={spring.onPressOut}
      disabled={!onItemPress}
      style={styles.legendItem}
    >
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }, spring.style]}>
        <View style={styles.legendLeft}>
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Text style={styles.legendAmount} numberOfLines={1}>
          {formatCurrency(item.amount, currency)}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

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
            <LegendItem key={item.id} item={item} currency={currency} onItemPress={onItemPress} styles={styles} />
          ))}
        </View>
      )}
    </View>
  );
}
