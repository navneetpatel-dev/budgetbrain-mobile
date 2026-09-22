import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { useReducedMotion } from './useReducedMotion.hook';

/**
 * Shared press-feedback primitive for interactive surfaces (buttons, pressable cards).
 * Scales down to `targetScale` on press-in with a spring, back to 1 on press-out —
 * the single standardized press treatment across the shared UI kit (replaces the
 * previously inconsistent 0.88/0.94/0.98 opacity/scale values scattered per component).
 * Falls back to an instant (non-animated) scale change when reduced motion is on.
 */
export function useSpringPress(targetScale = 0.96) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    // eslint-disable-next-line react-hooks/immutability -- Reanimated SharedValue.value mutation is the documented idiomatic pattern, not a React state mutation.
    scale.value = reducedMotion ? targetScale : withSpring(targetScale, theme.motion.spring);
  };
  const onPressOut = () => {
    // eslint-disable-next-line react-hooks/immutability -- see justification above.
    scale.value = reducedMotion ? 1 : withSpring(1, theme.motion.spring);
  };

  return { style, onPressIn, onPressOut };
}
