import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { BrandMark } from './BrandMark';
import { createStyles } from './AppLoadingScreen.styles';

function PulseRing({
  color,
  delay,
  reduced,
  ringStyle,
}: {
  color: string;
  delay: number;
  reduced: boolean;
  ringStyle: ViewStyle;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      progress.value = 0.35;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: reduced ? 0.18 : 0.45 * (1 - progress.value),
    transform: [{ scale: reduced ? 1 : 0.72 + progress.value * 0.55 }],
  }));

  return <Animated.View style={[ringStyle, { borderColor: color }, style]} />;
}

function LoadingDot({ delay, reduced }: { delay: number; reduced: boolean }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bounce = useSharedValue(reduced ? 1 : 0.35);

  useEffect(() => {
    if (reduced) {
      bounce.value = 1;
      return;
    }
    bounce.value = 0.35;
    bounce.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
    return () => cancelAnimation(bounce);
  }, [bounce, delay, reduced]);

  const style = useAnimatedStyle(() => ({
    opacity: bounce.value,
    transform: [{ scale: 0.75 + bounce.value * 0.35 }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function AppLoadingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const reduced = useReducedMotion();
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      breathe.value = 1;
      return;
    }
    breathe.value = withRepeat(
      withTiming(1.05, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(breathe);
  }, [breathe, reduced]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <View style={styles.root} accessibilityRole="progressbar" accessibilityLabel="BudgetBrain is loading">
      <LinearGradient
        colors={[theme.colors.primary + '22', theme.colors.gradientEnd + '14', 'transparent']}
        start={{ x: 0.5, y: 0.15 }}
        end={{ x: 0.5, y: 0.85 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.markWrap}>
        <PulseRing color={theme.colors.primary} delay={0} reduced={reduced} ringStyle={styles.ring} />
        <PulseRing color={theme.colors.secondary} delay={600} reduced={reduced} ringStyle={styles.ring} />
        <Animated.View style={[styles.mark, markStyle]}>
          <BrandMark size={88} />
        </Animated.View>
      </View>

      <Text style={styles.wordmark}>
        Budget<Text style={styles.wordmarkAccent}>Brain</Text>
      </Text>
      <Text style={styles.caption}>Loading your finances</Text>

      <View style={styles.dots}>
        <LoadingDot delay={0} reduced={reduced} />
        <LoadingDot delay={160} reduced={reduced} />
        <LoadingDot delay={320} reduced={reduced} />
      </View>
    </View>
  );
}
