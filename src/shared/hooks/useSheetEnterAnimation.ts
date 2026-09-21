import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from './useReducedMotion';

/**
 * Shared entrance motion for bottom-sheet and centered-dialog surfaces.
 * Fade only — no spring / bounce, per product UI.
 */
export function useSheetEnterAnimation(visible: boolean, _kind: 'sheet' | 'dialog' = 'sheet') {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      progress.value = reducedMotion ? 1 : withTiming(1, { duration: 180 });
    } else {
      progress.value = 0;
    }
  }, [visible, reducedMotion, progress]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
}
