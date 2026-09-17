import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { useReducedMotion } from './useReducedMotion';

/**
 * Shared entrance motion for bottom-sheet and centered-dialog surfaces
 * (`ActionSheet`, `DateInput`'s iOS picker sheet, `ConfirmDialog`) — replaces the
 * previously inconsistent fade/no-animation treatments with one spring language:
 * bottom sheets spring up from a slight offset, dialogs spring up from a slight scale.
 * The surrounding RN `Modal` still handles the backdrop fade in/out; this hook only
 * drives the inner content's entrance, keyed on the `visible`/`open` boolean.
 */
export function useSheetEnterAnimation(visible: boolean, kind: 'sheet' | 'dialog' = 'sheet') {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      progress.value = reducedMotion ? 1 : withSpring(1, theme.motion.spring);
    } else {
      progress.value = 0;
    }
  }, [visible, reducedMotion, theme.motion.spring, progress]);

  return useAnimatedStyle(() => {
    if (kind === 'dialog') {
      return {
        opacity: progress.value,
        transform: [{ scale: 0.92 + progress.value * 0.08 }],
      };
    }
    return {
      transform: [{ translateY: (1 - progress.value) * 24 }],
    };
  });
}
