import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';

const FEATURES: { icon: AppIconName; text: string; short: string }[] = [
  { icon: 'shield', text: 'Bank-grade security', short: 'Secure' },
  { icon: 'chart', text: 'Smart spending insights', short: 'Insights' },
  { icon: 'target', text: 'Reach your goals', short: 'Goals' },
  { icon: 'ai', text: 'AI budgeting tips', short: 'AI tips' },
];

const DURATION_MS = 24000;

export function AuthFeatureTicker({ compact = false }: { compact?: boolean }) {
  const styles = useMemo(() => createStyles(compact), [compact]);
  const [loopWidth, setLoopWidth] = useState(0);
  const translateX = useSharedValue(0);
  const items = useMemo(() => [...FEATURES, ...FEATURES], []);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setLoopWidth(w / 2);
  };

  useEffect(() => {
    if (loopWidth <= 0) return;
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-loopWidth, { duration: DURATION_MS, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(translateX);
  }, [loopWidth, translateX]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.track, animStyle]} onLayout={onLayout}>
        {items.map((item, i) => (
          <View key={`${item.text}-${i}`} style={styles.pill}>
            <AppIcon name={item.icon} size={compact ? 12 : 13} color="rgba(255,255,255,0.95)" />
            <Text style={styles.pillText}>{compact ? item.short : item.text}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function AuthFeatureTickerRail({
  padX,
  compact = false,
}: {
  padX: number;
  compact?: boolean;
}) {
  return (
    <View style={{ alignSelf: 'stretch', marginHorizontal: -padX, overflow: 'hidden' }}>
      <AuthFeatureTicker compact={compact} />
    </View>
  );
}

function createStyles(compact: boolean) {
  return StyleSheet.create({
    wrap: {
      width: '100%',
      marginTop: compact ? 12 : 16,
      overflow: 'hidden',
    },
    track: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compact ? 14 : 22,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: compact ? 10 : 12,
      paddingVertical: compact ? 4 : 5,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.11)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.15)',
    },
    pillText: {
      fontSize: compact ? 11 : 12,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.9)',
    },
  });
}
